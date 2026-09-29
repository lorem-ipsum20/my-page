"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Chat, useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowUp, RotateCcw, Square, Trash2, X } from "lucide-react";
import { SUGGESTED_QUESTIONS } from "@/lib/assistant";
import { profile } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Mascot, type MascotExpression } from "@/components/mascot/mascot";
import { Markdown } from "./markdown";

const STORAGE_KEY = "nova-chat:v1";
const UNDO_MS = 8000;

function loadStoredMessages(): UIMessage[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UIMessage[];
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(
      (message) =>
        typeof message?.id === "string" &&
        (message.role === "user" || message.role === "assistant") &&
        Array.isArray(message.parts),
    );
  } catch {
    return null;
  }
}

/**
 * The companion's chat panel.
 *
 * Streams from POST /api/chat, which answers only from the serialized data.ts
 * (see src/lib/assistant.ts). The panel is a plain positioned sibling of the
 * companion wrapper — no portal — so it inherits the page's theme and pointer
 * rules naturally.
 */

function MessageBubble({
  role,
  text,
  isStreaming,
}: {
  role: "user" | "assistant";
  text: string;
  isStreaming: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm",
          isUser
            ? "rounded-br-sm bg-brand text-white"
            : "rounded-bl-sm border border-border bg-card",
        )}
      >
        {/* Markdown renders live while streaming; the caret rides on the last
            block so partial **bold** can't flash as literal asterisks. */}
        <Markdown
          text={text}
          className={
            isStreaming
              ? "[&>*:last-child]:after:ml-0.5 [&>*:last-child]:after:animate-pulse [&>*:last-child]:after:content-['▍']"
              : undefined
          }
        />
      </div>
    </div>
  );
}

export function ChatPanel({
  open,
  onClose,
  onExpressionChange,
}: {
  open: boolean;
  onClose: () => void;
  /** Lets the companion mirror each point in the chat lifecycle. */
  onExpressionChange?: (expression: MascotExpression) => void;
}) {
  // The Chat instance is created once and seeds itself from localStorage, so
  // the first paint already shows the restored conversation (no flash, no
  // hydration mismatch). useChat receives it via the `chat` option; the finish
  // callback persists the final history via its own arguments, not closure state.
  const [chat] = useState(
    () =>
      new Chat({
        id: "nova-portfolio",
        transport: new DefaultChatTransport({ api: "/api/chat" }),
        messages: loadStoredMessages() ?? [],
        onFinish: ({ messages: finalMessages }) => {
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(finalMessages));
          } catch {
            // Private mode or full quota: persistence is best-effort.
          }
        },
      }),
  );

  const { messages, sendMessage, setMessages, clearError, status, error, regenerate, stop } =
    useChat({ chat });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Conversation backup for the undo toast; null when there is nothing to undo.
  const [undoSnapshot, setUndoSnapshot] = useState<UIMessage[] | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Follow-ups offered between replies: every sample the visitor hasn't asked
  // yet, shuffled so each visit nudges a different corner of the portfolio.
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);

  // Restore the previous conversation once, on mount. useChat starts with
  // initialMessages already, so the first paint is correct and hydration-safe.
  const busy = status === "submitted" || status === "streaming";
  const mascotExpression: MascotExpression = error
    ? "concerned"
    : status === "submitted"
      ? "thinking"
      : status === "streaming"
        ? "speaking"
        : open
          ? "listening"
          : "idle";

  useEffect(() => {
    onExpressionChange?.(mascotExpression);
  }, [mascotExpression, onExpressionChange]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Grows the composer with the draft, up to max-h; rows=1 keeps the min size.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`;
  }, [input]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit(input);
    }
  };

  // Reset the conversation to Nova's greeting. Aborting first keeps a live
  // stream from writing into a history we just emptied. The previous turns are
  // snapshotted so the toast can put them back within the undo window.
  const clearConversation = () => {
    if (busy) stop();
    clearError();
    if (messages.length === 0) return;
    setUndoSnapshot(messages);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => {
      setUndoSnapshot(null);
      undoTimer.current = null;
    }, UNDO_MS);
    setMessages([]);
    textareaRef.current?.focus();
  };

  const undoClear = () => {
    if (undoTimer.current) {
      clearTimeout(undoTimer.current);
      undoTimer.current = null;
    }
    setMessages(undoSnapshot ?? []);
    setUndoSnapshot(null);
  };

  // A suggestion counts as asked only when it reached the wire as a user turn;
  // cleared or failed attempts keep the chip available.
  const remainingSuggestions = SUGGESTED_QUESTIONS.filter(
    (question) => !askedQuestions.includes(question),
  );

  const submit = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    setInput("");
    if ((remainingSuggestions as readonly string[]).includes(value)) {
      setAskedQuestions((current) => [...current, value]);
    }
    sendMessage({ text: value });
  };

  // Phone: a sheet above the section dock, sized by its insets (a width would
  // fight `right` and push the panel off screen). From md up it moves to the
  // bottom-LEFT, which is empty at that width — leaving the companion visible in
  // the bottom-right while it thinks, instead of hiding the character behind
  // its own chat.
  const placement =
    "max-md:bottom-[64px] max-md:left-3 max-md:right-3 md:bottom-5 md:left-5 md:right-auto md:w-96";

  return (
    <div
      role="dialog"
      aria-label="Ask about Aman"
      aria-hidden={!open}
      // Closed panels stay mounted (so the conversation survives a close), so
      // `inert` is what keeps their buttons out of the tab order and away from
      // assistive tech while they are invisible.
      inert={!open}
      className={cn(
        // z-50, above the back-to-top button and the dock (both z-40), which it
        // covers at phone widths — so it is opaque there rather than letting
        // them show through, and translucent only from md up, where it floats
        // over the empty margin instead of over controls.
        "fixed z-50 flex max-h-[min(30rem,70dvh)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-lg shadow-black/5 max-md:bg-background md:bg-background/90 md:backdrop-blur transition-[opacity,transform] duration-300 ease-out",
        placement,
        open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <header className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {/* On a phone the docked mascot sits behind this sheet, so Nova gets a
              second, chat-native stage here rather than disappearing mid-chat. */}
          <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-brand/20 bg-brand-soft/50 shadow-sm">
            <Mascot className="size-full" expression={mascotExpression} />
            <span
              aria-hidden
              className={cn(
                "absolute right-0.5 top-0.5 size-1.5 rounded-full ring-2 ring-background",
                busy ? "animate-pulse bg-brand" : "bg-emerald-500",
              )}
            />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium">Nova</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {busy ? "Sharing an answer…" : "Ask about Aman’s work"}
            </p>
          </div>
        </div>
        {/* Hidden while there is nothing to clear, so a fresh chat doesn't
            open with a disabled control. */}
        <div className="flex items-center gap-0.5">
          {(messages.length > 0 || error) && (
            <button
              type="button"
              onClick={clearConversation}
              aria-label="Clear conversation"
              title="Clear conversation"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Trash2 className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4 overscroll-contain"
      >
        {messages.length === 0 && (
          <div className="space-y-3 pt-1">
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Hi, I&apos;m Nova 👋 — ask me anything about {profile.name.split(" ")[0]}&apos;s
              experience, projects or how to reach him.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {remainingSuggestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => submit(question)}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-[12px] text-muted-foreground transition-colors hover:border-brand/50 hover:text-brand"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Follow-ups once the conversation has started: the samples not yet
            asked, so chips never re-offer something already answered. */}
        {messages.length > 0 && !busy && remainingSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {remainingSuggestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => submit(question)}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-[12px] text-muted-foreground transition-colors hover:border-brand/50 hover:text-brand"
              >
                {question}
              </button>
            ))}
          </div>
        )}

        {messages.map((message) => {
          if (message.role === "system") return null;
          const role = message.role;
          return message.parts.map((part, index) => {
            if (part.type !== "text") return null;
            const isLastTextPart = message.parts.filter((p) => p.type === "text").at(-1) === part;
            return (
              <MessageBubble
                key={`${message.id}-${index}`}
                role={role}
                text={part.text}
                isStreaming={isLastTextPart && status === "streaming" && role === "assistant"}
              />
            );
          });
        })}

        {status === "submitted" && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-border bg-card px-3.5 py-2.5">
              <span className="flex gap-1">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: `${dot * 150}ms` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[12px]">
            <span className="text-amber-700 dark:text-amber-400">
              Nova couldn&apos;t answer just now. The key may be missing or rate-limited.
            </span>
            <button
              type="button"
              onClick={() => regenerate()}
              className="inline-flex shrink-0 items-center gap-1 font-medium text-amber-700 hover:underline dark:text-amber-400"
            >
              <RotateCcw className="size-3" /> Retry
            </button>
          </div>
        )}
      </div>

      <form
        className="border-t border-border p-2"
        onSubmit={(event) => {
          event.preventDefault();
          submit(input);
        }}
      >
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-card px-2 py-1.5 transition-colors focus-within:border-brand/50">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder={busy ? "Nova is typing…" : "Ask about Aman…"}
            aria-label="Your question"
            className="max-h-24 flex-1 resize-none bg-transparent px-1.5 py-1 text-[13px] outline-none placeholder:text-muted-foreground"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => stop()}
              aria-label="Stop generating"
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
            >
              <Square className="size-3 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <ArrowUp className="size-4" />
            </button>
          )}
        </div>
      </form>

      {/* Undo toast — floats over the composer inside the panel, visible for a
          short window after clearing so the conversation can be restored. */}
      <AnimatePresence>
        {undoSnapshot && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute inset-x-2 bottom-16 z-10"
          >
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/95 px-3 py-2 shadow-lg shadow-black/10 backdrop-blur">
              <p className="text-[12px] text-muted-foreground">Conversation cleared</p>
              <button
                type="button"
                onClick={undoClear}
                className="shrink-0 rounded-md px-1.5 py-0.5 text-[12px] font-medium text-brand hover:bg-brand-soft/50"
              >
                Undo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
