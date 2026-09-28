"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { NAV_LINKS, profile } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const [activeSection, setActiveSection] = useState("");
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

  // Highlight the section that has most recently crossed the probe line.
  // A probe line is used instead of IntersectionObserver so the last section
  // still activates when the page bottoms out between two sections.
  useEffect(() => {
    const sections = NAV_LINKS.map((link) =>
      document.getElementById(link.href.slice(1)),
    ).filter((element): element is HTMLElement => element !== null);

    if (sections.length === 0) return;

    let frame = 0;

    const updateActiveSection = () => {
      frame = 0;
      const probe = window.innerHeight * 0.3;
      let current = sections[0].id;

      for (const section of sections) {
        if (section.getBoundingClientRect().top <= probe) current = section.id;
      }

      const atPageEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 8;

      if (atPageEnd) current = sections[sections.length - 1].id;

      setActiveSection((previous) => (previous === current ? previous : current));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
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
