import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { ASSISTANT_SYSTEM_PROMPT } from "@/lib/assistant";

/**
 * The portfolio companion's endpoint.
 *
 * Every request gets the same grounded system prompt (see src/lib/assistant.ts):
 * the model may only answer about Aman from the serialized data.ts, and must
 * say it doesn't know otherwise. There is no conversation storage anywhere —
 * history lives only in the visitor's browser for the length of the visit.
 *
 * Provider: OpenRouter's OpenAI-compatible endpoint with OPENROUTER_API_KEY.
 * Model via OPENROUTER_MODEL. The default is a FREE-TIER model — the portfolio
 * runs on free models only. A fallback chain handles the free tier's shared
 * rate limits: if the primary returns 429, the request retries down the chain
 * before the panel shows its friendly error banner.
 */
export const maxDuration = 30;

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

/**
 * Free-tier model chain, tried in order on 429 (rate limited). All are $0
 * prompt/completion on OpenRouter:
 *  - Nemotron 3 Ultra: NVIDIA's flagship free model, 1M context, strong
 *    instruction following — best markdown quality of the free roster.
 *  - Qwen 3.8 27B: lighter, fast, reliable — first fallback.
 *  - Gemma 4 31B: Google's free option — last resort before the error banner.
 * OPENROUTER_MODEL overrides the whole chain when set (single model).
 */
const FREE_MODEL_CHAIN = [
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "qwen/qwen3.8-27b:free",
  "google/gemma-4-31b-it:free",
];

/** Keep the prompt bounded no matter what the client sends. */
const MAX_MESSAGES = 16;

const RATE_LIMIT_MAX = 12;
const RATE_LIMIT_WINDOW_MS = 60_000;
const ANSWER_CACHE_SECONDS = 60 * 60 * 24;

/** Per-instance best effort: enough to stop casual spam, invisible to humans. */
const hits = new Map<string, number[]>();

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

function errorResponse(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

function openRouterHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    // These are optional attribution headers. Header values must be latin-1,
    // so no em dashes here.
    "HTTP-Referer": process.env.SITE_URL ?? "https://amansinganamala.vercel.app",
    "X-OpenRouter-Title": "Aman Singanamala - Portfolio",
  };
}

/**
 * Cache only a standalone text question. Follow-ups can rely on earlier turns,
 * so reusing an answer for them would be incorrect. Case, whitespace, and a
 * trailing question mark do not create duplicate cache entries.
 */
function getCacheableQuestion(messages: UIMessage[]) {
  if (messages.length !== 1 || messages[0].role !== "user") return null;

  const parts = messages[0].parts;
  type TextPart = Extract<(typeof parts)[number], { type: "text" }>;
  const textParts = parts.filter((part): part is TextPart => part.type === "text");
  if (textParts.length === 0 || textParts.length !== parts.length) return null;

  const question = textParts.map((part) => part.text).join(" ").trim();
  if (!question) return null;

  return question
    .toLocaleLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[?!.,]+$/, "");
}

function cachedTextResponse(text: string) {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({ type: "start-step" });
      writer.write({ type: "text-start", id: "text-1" });
      writer.write({ type: "text-delta", id: "text-1", delta: text });
      writer.write({ type: "text-end", id: "text-1" });
      writer.write({ type: "finish-step" });
      writer.write({ type: "finish", finishReason: "stop" });
      writer.setOutcome({ status: "completed" });
    },
  });

  return createUIMessageStreamResponse({
    stream,
    headers: { "X-Nova-Cache": "cached-answer" },
  });
}

type OpenRouterCompletion = {
  choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>;
};

function completionText(payload: OpenRouterCompletion) {
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) return content.map((part) => part.text ?? "").join("").trim();
  return "";
}

/**
 * Answer a standalone question, walking the free-model chain on 429. Only the
 * final, successful body is handed to Next's force-cache — failed attempts are
 * never cached, so a model recovering from rate-limit pressure heals itself.
 */
async function getCachedAnswer({
  apiKey,
  modelChain,
  question,
}: {
  apiKey: string;
  modelChain: string[];
  question: string;
}) {
  let lastError: unknown = new Error("no models configured");
  for (const modelId of modelChain) {
    try {
      // Next caches this POST by its URL, headers, and body. The body includes
      // the model, canonical question, and complete portfolio prompt, so an
      // updated profile or a changed model naturally gets its own cache entry.
      return await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: openRouterHeaders(apiKey),
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: "system", content: ASSISTANT_SYSTEM_PROMPT },
            { role: "user", content: question },
          ],
          temperature: 0.3,
          max_tokens: 2048,
        }),
        cache: "force-cache",
        next: { revalidate: ANSWER_CACHE_SECONDS },
        signal: AbortSignal.timeout(25_000),
      }).then(async (response) => {
        if (!response.ok) throw new Error(`OpenRouter returned ${response.status}`);
        const text = completionText((await response.json()) as OpenRouterCompletion);
        if (!text) throw new Error("OpenRouter returned an empty answer");
        return text;
      });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return errorResponse(
      429,
      "You're asking faster than I can think — give me a moment and try again.",
    );
  }

  let messages: UIMessage[];
  try {
    const body: { messages?: UIMessage[] } = await req.json();
    if (!Array.isArray(body.messages)) throw new Error("missing messages");
    messages = body.messages;
  } catch {
    return errorResponse(400, "That request didn't make sense to me.");
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterKey) {
    return errorResponse(
      503,
      "The companion isn't connected to a brain yet — the site owner still needs to add an API key.",
    );
  }

  // A pinned OPENROUTER_MODEL replaces the chain entirely; otherwise the free
  // models are tried in order, both for cached standalone answers and streams.
  const modelChain = process.env.OPENROUTER_MODEL
    ? [process.env.OPENROUTER_MODEL]
    : FREE_MODEL_CHAIN;

  const cacheableQuestion = getCacheableQuestion(messages);
  if (cacheableQuestion) {
    try {
      return cachedTextResponse(
        await getCachedAnswer({
          apiKey: openRouterKey,
          modelChain,
          question: cacheableQuestion,
        }),
      );
    } catch {
      return errorResponse(502, "Nova's circuits need a coffee break ☕ — please try again in a moment.");
    }
  }

  const model = createOpenAICompatible({
    name: "openrouter",
    baseURL: OPENROUTER_BASE_URL,
    apiKey: openRouterKey,
    headers: {
      "HTTP-Referer": process.env.SITE_URL ?? "https://amansinganamala.vercel.app",
      "X-OpenRouter-Title": "Aman Singanamala - Portfolio",
    },
  }).chatModel(modelChain[0]);

  const result = streamText({
    model,
    system: ASSISTANT_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages.slice(-MAX_MESSAGES)),
    temperature: 0.3,
    // Hard stop under the 30s function limit: a queued or stalled provider
    // surfaces as the panel's friendly error banner instead of an endless
    // spinner.
    abortSignal: AbortSignal.timeout(25_000),
    // Roomy enough for a reasoning model's hidden thinking plus a concise
    // visible reply; the system prompt is what keeps the reply short.
    maxOutputTokens: 2048,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
