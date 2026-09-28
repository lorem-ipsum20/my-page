"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Mascot } from "./mascot";

/**
 * Places the companion for every screen size.
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
    <div
      className={cn(
        // In flow, beside the name, while the hero is on screen.
        "shrink-0",
        // Docked below xl: the right edge, clear of the copy. On phones it
        // stacks above the back-to-top button (which itself sits above the
        // mobile nav pill's band); md–xl has no pill, so the stack is one step.
        // pointer-events-none so it never blocks taps on the content underneath.
        docked && "fixed right-6 bottom-[76px] z-30 size-24 pointer-events-none max-md:bottom-[130px]",
        // Docked from xl up: the margin the content column leaves free. The
        // right offset is the column's edge plus its 22px gap, which keeps the
        // companion clear of the copy at any width past xl. bottom-auto hands
        // positioning back to top, which the two states below set.
        "xl:pointer-events-none xl:fixed xl:z-30 xl:bottom-auto xl:size-[208px] xl:right-[calc(50%_-_542px)]",
        "xl:transition-[top] xl:duration-700 xl:ease-out xl:motion-reduce:transition-none",
        docked ? "xl:top-[calc(100vh_-_232px)]" : "xl:top-[4.5rem]",
      )}
    >
      <Mascot
        fallbackSrc={fallbackSrc}
        fallbackAlt={fallbackAlt}
        // The docked box is always 96px on mobile, so the canvas fills it there
        // instead of keeping the inline hero size.
        className={cn(docked ? "size-24" : "size-20 sm:size-24", "xl:size-full")}
      />
    </div>
  );
}
