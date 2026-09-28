"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => {
    ready: Promise<void>;
  };
};

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * A segmented sun/moon switch. Both options are always on the page and the
 * active one is highlighted, so the control reads as a switch even before the
 * first click — and shows the current theme instead of a static sun.
 *
 * next-themes cannot know the system theme during SSR and the first client
 * render, so the highlight and `aria-checked` only apply after mount. This
 * keeps hydration exact; a guessed highlight would mismatch the server HTML.
 * The buttons themselves work immediately — only the highlight waits.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Two frames so the flag lands strictly after hydration, which also keeps
    // the React 19 no-sync-setState-in-effect lint rule happy.
    const id = window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => setMounted(true)),
    );
    return () => window.cancelAnimationFrame(id);
  }, []);

  const isDark = resolvedTheme === "dark";

  const switchTo = useCallback(
    (next: "light" | "dark", event: React.MouseEvent<HTMLButtonElement>) => {
      const doc = document as ViewTransitionDocument;
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Fall back to an instant swap where the View Transitions API is unavailable.
      if (!doc.startViewTransition || prefersReducedMotion) {
        setTheme(next);
        return;
      }

      const x = event.clientX;
      const y = event.clientY;

      const transition = doc.startViewTransition(() => {
        flushSync(() => setTheme(next));
      });

      transition.ready
        .then(() => {
          const radius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y),
          );

          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${radius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 550,
              easing: EASE,
              pseudoElement: "::view-transition-new(root)",
            },
          );
        })
        .catch(() => {
          /* the theme already changed; the wipe is decorative */
        });
    },
    [setTheme],
  );

  const optionClasses = (active: boolean) =>
    cn(
      "inline-flex size-6 items-center justify-center rounded-full transition-colors duration-300",
      active
        ? "border border-border bg-background text-foreground"
        : "text-muted-foreground hover:text-foreground",
    );

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="inline-flex items-center rounded-full border border-border bg-muted/40 p-0.5"
    >
      <button
        type="button"
        role="radio"
        aria-label="Light theme"
        aria-checked={mounted ? !isDark : undefined}
        style={{ transitionTimingFunction: EASE }}
        className={optionClasses(mounted && !isDark)}
        onClick={(event) => switchTo("light", event)}
      >
        <Sun className="size-3.5" />
      </button>
      <button
        type="button"
        role="radio"
        aria-label="Dark theme"
        aria-checked={mounted ? isDark : undefined}
        style={{ transitionTimingFunction: EASE }}
        className={optionClasses(mounted && isDark)}
        onClick={(event) => switchTo("dark", event)}
      >
        <Moon className="size-3.5" />
      </button>
    </div>
  );
}
