"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Fades and lifts its children into view once. Pass `immediate` for content
 * that should animate on mount instead of on scroll (i.e. the hero).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  immediate?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const transition = { duration: 0.6, delay, ease: EASE };

  if (immediate) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, y }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -70px 0px" }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

/** A hairline rule that draws itself in from the left when scrolled into view. */
export function RevealRule({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className} />;
  }

  return (
    <motion.div
      className={className}
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.8, ease: EASE }}
      style={{ originX: 0 }}
    />
  );
}
