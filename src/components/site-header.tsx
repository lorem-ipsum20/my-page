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

      <nav className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-4 px-6">
        <a
          href="#top"
          className="text-sm font-medium tracking-tight whitespace-nowrap transition-colors hover:text-brand"
        >
          {profile.name}
        </a>

        <ul className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="group relative block py-1 text-[13px]"
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

        <div className="flex items-center gap-1">
          <a
            href={`mailto:${profile.email}`}
            className="hidden text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Email
          </a>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
