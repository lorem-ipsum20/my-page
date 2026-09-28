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
 * Provider: NVIDIA NIM's OpenAI-compatible endpoint (the same platform the DSA
 * Lab project uses), configured with NVIDIA_API_KEY. Model via NVIDIA_CHAT_MODEL,
 * default moonshotai/kimi-k3 — a reasoning model, so maxOutputTokens leaves it
 * headroom to think before answering. Without the key the panel shows a
 * graceful "not connected" message instead of an error.
 */
export const maxDuration = 30;

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
/** Catalog IDs are literal — kimi-k2 does not exist, kimi-k2.6 and kimi-k3 do. */
const DEFAULT_NVIDIA_MODEL = "moonshotai/kimi-k3";

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

  const nvidiaKey = process.env.NVIDIA_API_KEY;
  if (!nvidiaKey) {
    return errorResponse(
      503,
      "The companion isn't connected to a brain yet — the site owner still needs to add an API key.",
    );
  }

  const model = createOpenAICompatible({
    name: "nvidia",
    baseURL: NVIDIA_BASE_URL,
    apiKey: nvidiaKey,
  }).chatModel(process.env.NVIDIA_CHAT_MODEL ?? DEFAULT_NVIDIA_MODEL);

  const result = streamText({
    model,
    system: ASSISTANT_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages.slice(-MAX_MESSAGES)),
    temperature: 0.3,
    // Hard stop under the 30s function limit: a queued or stalled provider
    // surfaces as the panel's friendly error banner instead of an endless
    // spinner.
    abortSignal: AbortSignal.timeout(25_000),
    // Roomy enough for a reasoning model to think and still answer; the system
    // prompt is what keeps the *visible* reply to a few sentences.
    maxOutputTokens: 2048,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
