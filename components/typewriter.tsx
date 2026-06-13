"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";

/** Cycles through `words` with a typing effect. Shows the first word statically
 *  when the user prefers reduced motion. */
export function Typewriter({ words, className }: { words: string[]; className?: string }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [text, setText] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (reduce || words.length === 0) return;

    const current = words[index % words.length];
    let delay: number;
    let action: () => void;

    if (!deleting && text === current) {
      // Word fully typed — pause, then start deleting.
      delay = 1600;
      action = () => setDeleting(true);
    } else if (deleting && text === "") {
      // Word fully deleted — brief pause, then advance to the next word.
      delay = 400;
      action = () => {
        setDeleting(false);
        setIndex((i) => (i + 1) % words.length);
      };
    } else {
      delay = deleting ? 45 : 85;
      const next = deleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1);
      action = () => setText(next);
    }

    // All state updates run inside the timer callback, never synchronously in
    // the effect body — keeps the typing loop free of cascading renders.
    const timeout = setTimeout(action, delay);
    return () => clearTimeout(timeout);
  }, [text, deleting, index, words, reduce]);

  return (
    <span className={className} aria-live="polite">
      {reduce ? (words[0] ?? "") : text}
      {!reduce && (
        <span
          aria-hidden
          className="bg-brand ml-1 inline-block h-[1em] w-px translate-y-[0.1em] animate-pulse"
        />
      )}
    </span>
  );
}
