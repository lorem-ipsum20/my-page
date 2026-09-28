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
 * Model via OPENROUTER_MODEL, default ~openai/gpt-sol-latest. The tilde alias
 * follows the newest GPT Sol model without requiring a redeploy. Without a key
 * the panel shows a graceful "not connected" message instead of an error.
 */
export const maxDuration = 30;

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_OPENROUTER_MODEL = "~openai/gpt-sol-latest";

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

async function getCachedAnswer({
  apiKey,
  modelId,
  question,
}: {
  apiKey: string;
  modelId: string;
  question: string;
}) {
  // Next caches this POST by its URL, headers, and body. The body includes the
  // model, canonical question, and complete portfolio prompt, so an updated
  // profile or a changed model naturally gets its own cache entry.
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
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
  });

  if (!response.ok) throw new Error(`OpenRouter returned ${response.status}`);

  const text = completionText((await response.json()) as OpenRouterCompletion);
  if (!text) throw new Error("OpenRouter returned an empty answer");
  return text;
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

  const modelId = process.env.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL;
  const cacheableQuestion = getCacheableQuestion(messages);
  if (cacheableQuestion) {
    try {
      return cachedTextResponse(
        await getCachedAnswer({
          apiKey: openRouterKey,
          modelId,
          question: cacheableQuestion,
        }),
      );
    } catch {
      return errorResponse(502, "Nova couldn't reach her answer service. Please try again.");
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
  }).chatModel(modelId);

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
