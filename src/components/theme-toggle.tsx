"use client";

import { useCallback } from "react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => {
    ready: Promise<void>;
  };
};

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const next = resolvedTheme === "dark" ? "light" : "dark";
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
    [resolvedTheme, setTheme],
  );

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label="Toggle colour theme"
      className="rounded-full text-muted-foreground transition-transform duration-200 hover:text-foreground active:scale-90"
    >
      <span className="relative inline-flex size-4 items-center justify-center">
        <Sun
          className={`size-4 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0`}
          style={{ transitionTimingFunction: EASE }}
        />
        <Moon
          className="absolute size-4 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100"
          style={{ transitionTimingFunction: EASE }}
        />
      </span>
    </Button>
  );
}
