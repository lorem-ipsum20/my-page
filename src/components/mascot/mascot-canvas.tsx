"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "motion/react";
import {
  createMascot,
  MASCOT_PALETTES,
  type MascotExpression,
  type MascotHandle,
} from "./character";
import { cn } from "@/lib/utils";

type LoopControls = {
  start: () => void;
  renderOnce: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Hosts the WebGL cartoon companion.
 *
 * Never imported directly — `mascot.tsx` pulls this in with next/dynamic and
 * `ssr: false` so `three` stays out of the initial HTML entirely. The loop
 * stops whenever the canvas scrolls out of view or the tab is hidden, and a
 * static fallback is shown if WebGL is unavailable or the scene fails to build.
 */
export function MascotCanvas({
  className,
  fallbackSrc,
  fallbackAlt = "",
  expression = "idle",
}: {
  className?: string;
  fallbackSrc?: string;
  fallbackAlt?: string;
  expression?: MascotExpression;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<MascotHandle | null>(null);
  const controlsRef = useRef<LoopControls | null>(null);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const { resolvedTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion() ?? false;

  // Module-level constant, so this reference is stable per theme.
  const themeKey: "light" | "dark" = resolvedTheme === "dark" ? "dark" : "light";
  const palette = MASCOT_PALETTES[themeKey];

  const paletteRef = useRef(palette);
  const reduceMotionRef = useRef(prefersReducedMotion);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let frame = 0;
    let lastTime = 0;
    let onScreen = true;
    let teardown: (() => void) | undefined;

    // Scroll state for the companion's reactions: pixels moved since the last
    // frame, and a wave that a section crossing has asked for.
    let scrollDelta = 0;
    let lastScrollY = window.scrollY;
    let wavePending = false;

    const pointer = { x: 0, y: 0 };

    const build = () => {
      let handle: MascotHandle;
      try {
        handle = createMascot();
      } catch {
        // No WebGL context, or the scene failed to construct.
        setFailed(true);
        return;
      }

      if (disposed) {
        handle.dispose();
        return;
      }

      const canvas = handle.canvas;
      canvas.style.display = "block";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      container.appendChild(canvas);

      handle.setPalette(paletteRef.current);
      handle.setReduceMotion(reduceMotionRef.current);
      handleRef.current = handle;

      const resize = () => {
        const rect = container.getBoundingClientRect();
        handle.setSize(rect.width, rect.height);
      };

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      resize();

      const step = (time: number) => {
        frame = window.requestAnimationFrame(step);
        const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 1 / 60;
        lastTime = time;

        // Scroll speed in pixels per second, normalised so an ordinary flick
        // reads as full intent; the scene smooths it from there.
        const scrollLook = clamp(scrollDelta / (delta * 1500), -1, 1);
        scrollDelta = 0;

        handle.render({
          elapsed: time / 1000,
          delta,
          pointer,
          scrollLook,
          wave: wavePending,
        });
        wavePending = false;
      };

      const stopLoop = () => {
        if (frame) {
          window.cancelAnimationFrame(frame);
          frame = 0;
        }
        // Nothing can be delivered off screen, so drop the request rather than
        // letting it fire the next time the companion is looked at.
        wavePending = false;
        scrollDelta = 0;
      };

      const startLoop = () => {
        if (reduceMotionRef.current || !onScreen || document.hidden) return;
        if (frame) return;
        lastTime = 0;
        lastScrollY = window.scrollY;
        scrollDelta = 0;
        wavePending = false;
        frame = window.requestAnimationFrame(step);
      };

      controlsRef.current = {
        start: startLoop,
        renderOnce: () => {
          stopLoop();
          handle.setReduceMotion(true);
          handle.render({ elapsed: 0, delta: 1, pointer, scrollLook: 0 });
        },
      };

      if (reduceMotionRef.current) {
        // One settled frame, no animation loop at all.
        controlsRef.current.renderOnce();
      } else {
        startLoop();
      }

      const onPointerMove = (event: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        if (rect.width === 0) return;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        pointer.x = clamp((event.clientX - centerX) / (window.innerWidth * 0.5), -1, 1);
        pointer.y = clamp((event.clientY - centerY) / (window.innerHeight * 0.5), -1, 1);
      };

      const onVisibilityChange = () => {
        if (document.hidden) stopLoop();
        else startLoop();
      };

      // Only the distance the page moved matters, so this stays a cheap passive
      // listener and the per-second figure is derived in the frame loop.
      const onScroll = () => {
        const y = window.scrollY;
        scrollDelta += y - lastScrollY;
        lastScrollY = y;
      };

      // Nothing to animate while the hero is scrolled away.
      const intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          onScreen = entry.isIntersecting;
          if (onScreen) startLoop();
          else stopLoop();
        },
        { threshold: 0 },
      );
      intersectionObserver.observe(container);

      // Reaching one of these sections earns a wave, so the companion reacts to
      // where the reader is on the page and not only to the cursor. The squeezed
      // root margin makes a section count as reached when it crosses the middle
      // of the screen, and the on-screen check means a wave asked for while the
      // companion itself is out of view is dropped instead of queued.
      const waveSections = ["projects", "contact"]
        .map((id) => document.getElementById(id))
        .filter((element): element is HTMLElement => element !== null);

      const sectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && onScreen) wavePending = true;
          }
        },
        { rootMargin: "-35% 0px -35% 0px" },
      );

      for (const section of waveSections) sectionObserver.observe(section);

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      document.addEventListener("visibilitychange", onVisibilityChange);

      setReady(true);

      teardown = () => {
        stopLoop();
        controlsRef.current = null;
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        sectionObserver.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("scroll", onScroll);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        canvas.remove();
        handle.dispose();
        handleRef.current = null;
      };
    };

    build();

    return () => {
      disposed = true;
      teardown?.();
    };
  }, []);

  // Theme changes only repaint the palette; the scene is never rebuilt.
  useEffect(() => {
    paletteRef.current = palette;
    const handle = handleRef.current;
    if (!handle) return;
    handle.setPalette(palette);
    if (reduceMotionRef.current) controlsRef.current?.renderOnce();
  }, [palette]);

  // Expressions are scene flags, not rebuilds. This keeps the transition from
  // listening to thinking to speaking fluid while an answer streams.
  useEffect(() => {
    handleRef.current?.setExpression(expression);
    if (reduceMotionRef.current) controlsRef.current?.renderOnce();
  }, [expression]);

  // Toggling the OS motion preference updates the live scene in place.
  useEffect(() => {
    reduceMotionRef.current = prefersReducedMotion;
    const handle = handleRef.current;
    if (!handle) return;
    handle.setReduceMotion(prefersReducedMotion);
    if (prefersReducedMotion) controlsRef.current?.renderOnce();
    else controlsRef.current?.start();
  }, [prefersReducedMotion]);

  if (failed && fallbackSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fallbackSrc}
        alt={fallbackAlt}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }

  if (failed) {
    return (
      <div
        aria-hidden
        className={cn("rounded-full bg-gradient-to-br from-brand/25 to-brand/5", className)}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={cn(
        "transition-opacity duration-700 ease-out",
        ready ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );
}
