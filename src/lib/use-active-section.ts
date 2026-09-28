"use client";

import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/data";

/**
 * The section currently in view.
 *
 * Uses the probe-line calculation (not IntersectionObserver) shared by the
 * header and the mobile dock, so the last section still activates when the
 * page bottoms out between two sections — an observer cannot guarantee that.
 */
export function useActiveSection() {
  const [activeSection, setActiveSection] = useState("");

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

  return activeSection;
}
