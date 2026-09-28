"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Mascot, type MascotExpression } from "./mascot";
import { ChatPanel } from "@/components/chat/chat-panel";

/**
 * Places the companion for every screen size, and makes it the front door to
 * the portfolio chat.
 *
 * In the hero it sits inline beside the name. Once the hero has scrolled past
 * it docks and stays on screen for the rest of the page: on phones and tablets
 * it lands just above the back-to-top button in the corner (the content column
 * leaves no margin there, so the corner is the only spot that never covers
 * copy), and from xl up it takes the free right margin instead. Without the
 * dock the companion would scroll away with the hero and have nothing left to
 * react to — the wave and the scroll nod depend on it staying visible.
 *
 * The parent must keep this outside the hero's <Reveal>: Motion puts a transform
 * on that element, which would become the containing block for a fixed child.
 */
export function MascotCompanion({
  fallbackSrc,
  fallbackAlt,
}: {
  fallbackSrc?: string;
  fallbackAlt?: string;
}) {
  const [docked, setDocked] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [expression, setExpression] = useState<MascotExpression>("idle");

  const toggleChat = () => {
    setChatOpen((isOpen) => {
      const nextOpen = !isOpen;
      setExpression(nextOpen ? "listening" : "idle");
      return nextOpen;
    });
  };

  const closeChat = () => {
    setChatOpen(false);
    setExpression("idle");
  };

  const expressionLabel = {
    idle: "Say hi",
    listening: "I’m listening",
    thinking: "Thinking",
    speaking: "Here’s what I found",
    concerned: "Let’s try that again",
  } satisfies Record<MascotExpression, string>;
  const mascotPrompt = chatOpen ? expressionLabel[expression] : "Ask Nova about Aman";

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;

    // Dock once the hero has largely left the viewport, measured from the page
    // rather than from a magic scroll offset.
    const observer = new IntersectionObserver(
      ([entry]) => setDocked(!entry.isIntersecting),
      { rootMargin: "-40% 0px 0px 0px" },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={toggleChat}
        aria-expanded={chatOpen}
        aria-haspopup="dialog"
        aria-label={`${chatOpen ? "Close" : "Open"} the chat about Aman`}
        title={chatOpen ? "Close chat" : "Chat with Nova about Aman"}
        className={cn(
          // Tapping the companion toggles the chat in both states, so the
          // feature is reachable wherever the character is on screen.
          "relative cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          // Docked state keeps pointer events so the chat can open from the
          // corner; the character is small and sits in free space by design.
          docked && "fixed right-6 bottom-[76px] z-30 size-24 pointer-events-auto max-md:bottom-[130px]",
          "xl:pointer-events-auto xl:fixed xl:z-30 xl:bottom-auto xl:size-[208px] xl:right-[calc(50%_-_542px)]",
          "xl:transition-[top] xl:duration-700 xl:ease-out xl:motion-reduce:transition-none",
          docked ? "xl:top-[calc(100vh_-_232px)]" : "xl:top-[4.5rem]",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -top-8 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-background/95 px-2.5 py-1 text-[10px] font-medium text-foreground shadow-sm backdrop-blur transition-all duration-300",
            chatOpen ? "translate-y-0" : "animate-[pulse_2.6s_ease-in-out_infinite]",
          )}
        >
          {mascotPrompt}
          {expression === "thinking" || expression === "speaking" ? (
            <span className="flex gap-0.5">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="size-1 animate-bounce rounded-full bg-brand"
                  style={{ animationDelay: `${dot * 120}ms` }}
                />
              ))}
            </span>
          ) : !chatOpen ? <span className="text-brand">↗</span> : null}
        </span>
        <Mascot
          fallbackSrc={fallbackSrc}
          fallbackAlt={fallbackAlt}
          // The docked box is always 96px on mobile, so the canvas fills it there
          // instead of keeping the inline hero size.
          className={cn(docked ? "size-24" : "size-20 sm:size-24", "xl:size-full")}
          expression={expression}
        />
      </button>

      <ChatPanel
        open={chatOpen}
        onClose={closeChat}
        onExpressionChange={setExpression}
      />
    </>
  );
}
