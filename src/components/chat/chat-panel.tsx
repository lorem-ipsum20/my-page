"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowUp, RotateCcw, X } from "lucide-react";
import { SUGGESTED_QUESTIONS } from "@/lib/assistant";
import { profile } from "@/lib/data";
import { cn } from "@/lib/utils";

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
          "max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed",
          isUser
            ? "rounded-br-sm bg-brand text-white"
            : "rounded-bl-sm border border-border bg-background/80",
        )}
      >
        <p className="whitespace-pre-wrap">
          {text}
          {isStreaming && <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-current align-middle" />}
        </p>
      </div>
    </div>
  );
}

export function ChatPanel({
  open,
  onClose,
  onBusyChange,
}: {
  open: boolean;
  onClose: () => void;
  /** Lets the companion's antenna pulse only while an answer is being composed. */
  onBusyChange?: (busy: boolean) => void;
}) {
  const { messages, sendMessage, status, error, regenerate } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const submit = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    setInput("");
    sendMessage({ text: value });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit(input);
    }
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
        "fixed z-50 flex max-h-[min(26rem,60dvh)] flex-col overflow-hidden rounded-2xl border border-border bg-background max-md:bg-background md:bg-background/90 md:backdrop-blur transition-[opacity,transform] duration-300 ease-out",
        placement,
        open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <header className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", busy ? "animate-pulse bg-brand" : "bg-emerald-500")} />
          <span className="text-[13px] font-medium">
            {busy ? "Bit is thinking…" : "Ask me about Aman 👋"}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <div className="space-y-3 pt-1">
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Hi, I&apos;m Bit 👋 — ask me anything about {profile.name.split(" ")[0]}&apos;s
              experience, projects or how to reach him.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => submit(question)}
                  className="rounded-full border border-border px-2.5 py-1 text-[12px] text-muted-foreground transition-colors hover:border-brand/50 hover:text-brand"
                >
                  {question}
                </button>
              ))}
            </div>
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
            <div className="rounded-2xl rounded-bl-sm border border-border bg-background/80 px-3 py-2">
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
              Bit couldn&apos;t answer just now. The key may be missing or rate-limited.
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
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder={busy ? "Bit is typing…" : "Ask about Aman…"}
            aria-label="Your question"
            className="max-h-24 flex-1 resize-none bg-transparent px-2 py-1.5 text-[13px] outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!input.trim() || busy}
            aria-label="Send message"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-opacity disabled:opacity-40"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
