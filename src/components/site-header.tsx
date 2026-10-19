"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { NAV_LINKS, profile } from "@/lib/data";
import { useActiveSection } from "@/lib/use-active-section";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const activeSection = useActiveSection();
  const [scrolled, setScrolled] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 32,
    restDelta: 0.0005,
  });

  // Swap the header chrome on once the page has moved.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-border bg-background/75 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-brand"
      />

      <nav className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-3 px-6">
        <a
          href="#top"
          className="shrink-0 text-sm font-medium tracking-tight whitespace-nowrap transition-colors hover:text-brand"
        >
          {profile.name}
        </a>

        {/*
          Eight chips now share the 624px content column with the name and the
          theme switch — the six that used to live here exactly filled it, so
          there was no room to add two more without giving something up: the
          chips are 12px with 12px gaps, and the header's email link is gone
          (the hero's social row and the Contact section both carry it).

          `min-w-0` + `overflow-x-auto` is the safety valve: if a future label
          is longer than the column allows, the chips scroll inside the header
          instead of pushing the theme switch off the page — which is exactly
          what the 13px version did at `md`.
        */}
        <ul className="hidden min-w-0 flex-1 items-center justify-center gap-3 overflow-x-auto [scrollbar-width:none] md:flex [&::-webkit-scrollbar]:hidden">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="group relative block py-1 text-[12px]"
                  aria-current={isActive ? "true" : undefined}
                >
                  <span
                    className={cn(
                      "transition-colors duration-200",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "absolute bottom-0 left-0 h-px w-full origin-left bg-foreground transition-transform duration-300 ease-out",
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
