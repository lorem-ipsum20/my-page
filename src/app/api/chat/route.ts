import {
  convertToModelMessages,
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

  const model = createOpenAICompatible({
    name: "openrouter",
    baseURL: OPENROUTER_BASE_URL,
    apiKey: openRouterKey,
    headers: {
      // Optional OpenRouter attribution headers (site rankings). Header values
      // must be latin-1, so no em dashes here.
      "HTTP-Referer": process.env.SITE_URL ?? "https://amansinganamala.vercel.app",
      "X-OpenRouter-Title": "Aman Singanamala - Portfolio",
    },
  }).chatModel(process.env.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL);

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
