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
 * Free-tier model chain, tried in order on 429 (rate limited) or 404
 * (retired model). All are $0 prompt/completion on OpenRouter:
 *  - Nemotron 3 Ultra: NVIDIA's flagship free model, 1M context, strong
 *    instruction following — best markdown quality of the free roster.
 *  - Qwen 3.8 27B: lighter, fast, reliable — first fallback.
 *  - Gemma 4 31B: Google's free option — last resort before the error banner.
 * OPENROUTER_MODEL overrides the whole chain when set (single model).
 *
 * The chat only works while at least one of these is live: free models come
 * and go on OpenRouter, so a 404 here should prompt replacing the dead ID
 * with a current one from https://openrouter.ai/models?max_price=0.
 */
const FREE_MODEL_CHAIN = [
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "qwen/qwen3.8-27b:free",
  "google/gemma-4-31b-it:free",
];

/** Keep the prompt bounded no matter what the client sends. */
const MAX_MESSAGES = 16;
/** A JSON body bigger than this is abusive (16 turns of prose is far smaller). */
const MAX_BODY_BYTES = 256 * 1024;

/**
 * The chat only ever posts from the portfolio itself, so anything else is
 * scripted abuse (bots scanning for open AI proxies).
 *
 * Matched on HOST, not exact origin string: `localhost:3000` is Next's default
 * but `next dev` picks a random free port when 3000 is taken (this exact
 * problem silently 403'd every local chat), and Vercel preview deployments
 * live under project-specific `*.vercel.app` subdomains. Anchors and paths
 * never reach the server — the Origin header is scheme + host + port only.
 * A missing Origin (curl, server-to-server) is allowed through and still
 * faces the rate limit; blocking it would break the cached-answer path.
 */
const SITE_ORIGIN = process.env.SITE_URL ?? "https://amansinganamala.vercel.app";

function isAllowedOrigin(origin: string) {
  let hostname: string;
  try {
    // hostname (not host): the port must never leak into the comparisons,
    // or `localhost:3210` would fail a `localhost` check.
    hostname = new URL(origin).hostname;
  } catch {
    return false;
  }
  const siteHostname = new URL(SITE_ORIGIN).hostname;
  if (hostname === siteHostname || hostname.endsWith(".vercel.app")) return true;
  return hostname === "localhost" || hostname.endsWith(".localhost") || hostname.startsWith("127.0.0.1");
}

const RATE_LIMIT_MAX = 12;
const RATE_LIMIT_WINDOW_MS = 60_000;
const ANSWER_CACHE_SECONDS = 60 * 60 * 24;

/**
 * Coffee-break one-liners for upstream outages, cycled by request count so a
 * visitor hammering retry sees variety instead of the same line. Mirrors the
 * panel-side list in chat-panel.tsx — keep the two in sync thematically.
 */
const UPSTREAM_QUIPS = [
  "Nova's circuits need a coffee break ☕ — please try again in a moment.",
  "My brain just buffering... give me a sec and ask again 🌀",
  "404: witty answer not found. Even robots have off days — retry? 🤖",
  "The AI gods are busy right now 🙏 — summon me again in a minute.",
  "Shh... Nova's gears are overheating ⚙️ — one moment, please.",
];

let quipCursor = 0;

function quipForRequest() {
  // Per-instance counter: good enough to rotate for any single visitor.
  quipCursor = (quipCursor + 1) % UPSTREAM_QUIPS.length;
  return UPSTREAM_QUIPS[quipCursor];
}

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

/**
 * One structured line per rejected request, so abuse is visible in the Vercel
 * log drain without parsing prose. Request context only: never log message
 * contents — a question about someone's CV is still private data.
 */
function logRejection(req: Request, ip: string, reason: string, detail?: string) {
  console.warn(
    JSON.stringify({
      event: "nova_request_rejected",
      reason,
      detail: detail ?? null,
      ip,
      origin: req.headers.get("origin") ?? null,
      referer: req.headers.get("referer") ?? null,
      contentLength: req.headers.get("content-length"),
      userAgent: req.headers.get("user-agent")?.slice(0, 180) ?? null,
    }),
  );
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
 * One structured line per exhausted chain, naming which model failed how —
 * a 404 means the free model was retired (swap in a current ID), a 429 means
 * shared free-tier pressure. Message contents are never logged.
 */
function logUpstreamFailure(statuses: string[]) {
  console.warn(
    JSON.stringify({
      event: "nova_upstream_exhausted",
      models: statuses,
    }),
  );
}

/**
 * Answer a standalone question, walking the free-model chain on 429 (rate
 * limit) or 404 (retired model). Other statuses and network errors end the
 * walk — retrying a 500 elsewhere rarely helps inside a 25s budget. Only the
 * final, successful body is handed to Next's force-cache — failed attempts
 * are never cached, so a model recovering from pressure heals itself.
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
  const statuses: string[] = [];

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
        statuses.push(`${modelId}:${response.status}`);
        if (!response.ok) throw new Error(`OpenRouter returned ${response.status}`);
        const text = completionText((await response.json()) as OpenRouterCompletion);
        if (!text) throw new Error("OpenRouter returned an empty answer");
        return text;
      });
    } catch (error) {
      lastError = error;
      const retriable =
        error instanceof Error &&
        (error.message.includes("429") || error.message.includes("404"));
      if (!retriable) break;
    }
  }

  logUpstreamFailure(statuses);
  throw lastError;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // Same-origin gate: the chat only ever posts from the portfolio itself, so
  // anything else is scripted abuse (bots scanning for open AI proxies).
  const origin = req.headers.get("origin");
  if (origin && !isAllowedOrigin(origin)) {
    logRejection(req, ip, "cross_origin", origin);
    return errorResponse(403, "I only answer questions asked from my home site.");
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    logRejection(req, ip, "body_too_large", `${contentLength} bytes`);
    return errorResponse(413, "That question is way too long for me to hold.");
  }

  if (isRateLimited(ip)) {
    logRejection(req, ip, "rate_limited", `${RATE_LIMIT_MAX} requests in ${RATE_LIMIT_WINDOW_MS / 1000}s`);
    return errorResponse(
      429,
      "Whoa, one at a time! 🤯 Nova's tiny fans are spinning at max — let her cool down for a minute.",
    );
  }

  let messages: UIMessage[];
  try {
    const body: { messages?: UIMessage[] } = await req.json();
    if (!Array.isArray(body.messages)) throw new Error("missing messages");
    messages = body.messages;
  } catch {
    logRejection(req, ip, "malformed_body");
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
      return errorResponse(502, quipForRequest());
    }
  }

  const openrouter = createOpenAICompatible({
    name: "openrouter",
    baseURL: OPENROUTER_BASE_URL,
    apiKey: openRouterKey,
    headers: {
      "HTTP-Referer": process.env.SITE_URL ?? "https://amansinganamala.vercel.app",
      "X-OpenRouter-Title": "Aman Singanamala - Portfolio",
    },
  });

  // The streaming path walks the chain too. Each attempt must fail BEFORE any
  // token has been shown to the visitor, so a 429/404 on one model can hand
  // over to the next cleanly; once tokens are flowing, errors surface as the
  // panel's friendly banner instead of a mid-sentence restart.
  let lastError: unknown = new Error("no models configured");
  for (const modelId of modelChain) {
    const result = streamText({
      model: openrouter.chatModel(modelId),
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

    try {
      // The response promise settles as soon as the upstream answers: rejected
      // for a refused request (429 quota, 404 retired model, 401 bad key),
      // resolved once the response headers arrive — before any visible token
      // is produced. That makes it the clean handover point between models.
      await result.response;
      return createUIMessageStreamResponse({
        stream: toUIMessageStream({ stream: result.stream }),
      });
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const retriable = message.includes("429") || message.includes("404");
      console.warn(
        JSON.stringify({
          event: "nova_stream_model_failed",
          model: modelId,
          retriable,
          error: message.slice(0, 200),
        }),
      );
      if (!retriable) break;
    }
  }

  logUpstreamFailure(modelChain.map((modelId) => `${modelId}:stream-failed`));
  throw lastError;
}
