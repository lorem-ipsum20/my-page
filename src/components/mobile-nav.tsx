"use client";

import { useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "@/lib/data";
import { useActiveSection } from "@/lib/use-active-section";
import { cn } from "@/lib/utils";

/**
 * The mobile navigation: a frosted pill fixed at the bottom centre, visible
 * below the header's `md` breakpoint only.
 *
 * The active section is highlighted with the same probe-line logic the header
 * uses, so both disagree never. The pill hides while the reader scrolls down
 * and returns as soon as they scroll up or stop — it stays reachable without
 * ever sitting on top of the text being read.
 *
 * It is anchored left-centre rather than dead centre so it never collides with
 * the back-to-top button in the right corner, and it sits below the docked
 * companion's corner spot (which stacks above it, top edge at 76px).
 */
export function MobileNav() {
  const activeSection = useActiveSection();
  const [hidden, setHidden] = useState(false);
  const suppressUntilRef = useRef(0);

  useEffect(() => {
    let lastY = window.scrollY;
    let accumulatingDown = 0;
    let accumulatingUp = 0;
    let frame = 0;

    const onScroll = () => {
      // Tapping a chip smooth-scrolls down the page, which is indistinguishable
      // from a reading scroll for a moment. Ignore deltas shortly after a tap on
      // the dock so using it never hides it.
      if (performance.now() < suppressUntilRef.current) {
        accumulatingDown = 0;
        return;
      }

      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;

      // Accumulate so a jittery trackpad does not flicker the pill; a net
      // movement of ~24px in one direction flips the state.
      if (delta > 0) {
        accumulatingDown += delta;
        accumulatingUp = 0;
      } else if (delta < 0) {
        accumulatingUp -= delta;
        accumulatingDown = 0;
      }

      if (accumulatingDown > 24 && y > 120) setHidden(true);
      else if (accumulatingUp > 24 || y <= 120) setHidden(false);
    };

    const onScrollRaf = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        onScroll();
      });
    };

    window.addEventListener("scroll", onScrollRaf, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScrollRaf);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <nav
      aria-label="Sections"
      onPointerDown={() => {
        suppressUntilRef.current = performance.now() + 1500;
      }}
      className={cn(
        "fixed bottom-4 left-4 z-40 max-w-[calc(100vw-2rem)] md:hidden",
        "rounded-full border border-border bg-background/80 backdrop-blur-md",
        "transition-[opacity,transform,visibility] duration-300 ease-out",
        hidden
          ? "pointer-events-none invisible translate-y-3 opacity-0"
          : "visible translate-y-0 opacity-100",
      )}
    >
      <ul className="flex items-center overflow-x-auto px-1.5 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV_LINKS.map((link) => {
          const isActive = activeSection === link.href.slice(1);
          return (
            <li key={link.href}>
              <a
                href={link.href}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "inline-flex items-center whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px] transition-colors duration-200",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
