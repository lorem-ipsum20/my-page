"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Jumps back to the top once the intro has been scrolled away.
 *
 * The trigger is the hero leaving the viewport rather than a scroll offset, so
 * it stays right if the hero's height ever changes. While hidden it is also
 * `invisible`, which keeps it out of the tab order and the accessibility tree
 * instead of leaving an invisible focus stop at the bottom of the page.
 *
 * It shares the corner with the docked companion at xl and up, but the two do
 * not collide: the companion sits in the margin, which leaves this clear at
 * every width past the breakpoint.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <Button
      // Ghost rather than outline: outline carries `dark:bg-input/30`, which is
      // a separate variant group and so is emitted after these classes, leaving
      // the surface to the variant in dark mode. Ghost only colours on hover.
      variant="ghost"
      size="icon"
      aria-label="Back to top"
      // No `behavior` option on purpose: the page's own scroll-behavior decides,
      // and it already turns itself off under reduced motion.
      onClick={() => window.scrollTo({ top: 0 })}
      className={cn(
        // On phones this sits above the mobile nav pill's band (bottom-4 +
        // ~45px), with the docked companion stacked above it in turn; from md up
        // there is no pill, so it returns to the plain corner.
        "fixed right-6 bottom-[76px] z-40 md:bottom-6 size-10 rounded-full border border-border bg-background/80 backdrop-blur-md transition-[opacity,transform,visibility] duration-300 ease-out hover:-translate-y-0.5 hover:text-brand",
        visible
          ? "visible translate-y-0 opacity-100"
          : "invisible translate-y-2 opacity-0",
      )}
    >
      <ArrowUp className="size-4" />
    </Button>
  );
}
