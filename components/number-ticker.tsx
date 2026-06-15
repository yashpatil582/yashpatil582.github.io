"use client";

import * as React from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";

/**
 * Counts the numeric part of a metric string up to its value when scrolled into
 * view, leaving prefix/suffix static (so "2M+", "+15%", "<50ms", "~4 yrs" all
 * animate cleanly). Pair with `tabular-nums` to avoid width jitter. Renders the
 * true value for SSR / no-JS / reduced-motion / screen readers — the count-up is
 * a progressive enhancement only.
 */
export function NumberTicker({ value, className }: { value: string; className?: string }) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const parsed = React.useMemo(() => {
    const m = value.match(/^(\D*)(\d[\d,.]*)(.*)$/);
    if (!m) return null;
    const numStr = m[2];
    const decimals = numStr.includes(".") ? (numStr.split(".")[1]?.length ?? 0) : 0;
    return {
      prefix: m[1],
      suffix: m[3],
      target: parseFloat(numStr.replace(/,/g, "")),
      decimals,
    };
  }, [value]);

  const target = parsed?.target ?? 0;
  // Start at the true value so SSR / no-JS / reduced-motion are all correct.
  const mv = useMotionValue(target);
  const display = useTransform(mv, (v) =>
    parsed && parsed.decimals > 0 ? v.toFixed(parsed.decimals) : Math.round(v).toLocaleString(),
  );

  React.useEffect(() => {
    if (reduce || !parsed || !inView) return;
    mv.set(0);
    const controls = animate(mv, target, { duration: 0.9, ease: "easeOut" });
    return () => controls.stop();
  }, [inView, reduce, parsed, target, mv]);

  if (!parsed) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden>
        {parsed.prefix}
        <motion.span>{display}</motion.span>
        {parsed.suffix}
      </span>
    </span>
  );
}
