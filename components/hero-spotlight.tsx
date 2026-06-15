"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";

/**
 * The one futuristic flourish: a soft brand spotlight that follows the cursor
 * across the hero. CSS-var driven (`--mx`/`--my`) and rAF-throttled, so pointer
 * moves never trigger a React render and never read layout — at most one style
 * write per frame. Gated to fine pointers (touch keeps a static centered glow),
 * and frozen to a static glow under prefers-reduced-motion. Decorative only.
 */
export function HeroSpotlight() {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    const section = el?.parentElement;
    if (!el || !section) return;

    // Fade the glow in even without pointer input.
    el.dataset.active = "true";

    // Touch / coarse pointers keep the static centered glow — no tracking.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = 0;
    let x = 50;
    let y = 18;
    let pending = false;

    const apply = () => {
      pending = false;
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
    };

    const onMove = (e: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      x = ((e.clientX - rect.left) / rect.width) * 100;
      y = ((e.clientY - rect.top) / rect.height) * 100;
      if (!pending) {
        pending = true;
        raf = requestAnimationFrame(apply);
      }
    };

    section.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      section.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  return (
    <div
      ref={ref}
      aria-hidden
      data-reduce={reduce ? "true" : undefined}
      className="hero-spotlight pointer-events-none absolute inset-0 -z-10"
    />
  );
}
