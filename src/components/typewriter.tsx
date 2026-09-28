"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Types each word out, holds, deletes it and moves to the next.
 * Renders the first word statically when the user prefers reduced motion, and
 * exposes that word to screen readers instead of the animating characters.
 */
export function Typewriter({
  words,
  className,
  typingSpeed = 62,
  deletingSpeed = 32,
  holdDelay = 1600,
}: {
  words: readonly string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  holdDelay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;

    const word = words[wordIndex % words.length];

    // Finished typing the word — hold it before deleting.
    if (!isDeleting && text === word) {
      const timeout = setTimeout(() => setIsDeleting(true), holdDelay);
      return () => clearTimeout(timeout);
    }

    // Finished deleting — beat, then advance to the next word.
    if (isDeleting && text === "") {
      const timeout = setTimeout(() => {
        setIsDeleting(false);
        setWordIndex((index) => (index + 1) % words.length);
      }, 340);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(
      () => {
        setText((current) =>
          isDeleting
            ? word.slice(0, current.length - 1)
            : word.slice(0, current.length + 1),
        );
      },
      isDeleting ? deletingSpeed : typingSpeed,
    );

    return () => clearTimeout(timeout);
  }, [
    text,
    isDeleting,
    wordIndex,
    words,
    reduceMotion,
    typingSpeed,
    deletingSpeed,
    holdDelay,
  ]);

  if (reduceMotion) {
    return <span className={className}>{words[0]}</span>;
  }

  return (
    <span className={className}>
      <span className="sr-only">{words[0]}</span>
      <span aria-hidden>
        {text}
        <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.08em] animate-[blink_1.05s_steps(1,end)_infinite] bg-brand align-middle" />
      </span>
    </span>
  );
}
