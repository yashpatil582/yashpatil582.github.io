"use client";

import { motion, useReducedMotion } from "motion/react";

import { EASE_REVEAL, groupContainer, groupItem } from "@/lib/motion";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/** Fade-and-rise on scroll into view. No-ops for prefers-reduced-motion users. */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: EASE_REVEAL }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered scroll-reveal. Wrap a grid in <RevealGroup> and each item in
 * <RevealItem>; the group triggers once in view and the children rise in sequence
 * via variant propagation. One IntersectionObserver for the whole group rather
 * than one per item. No-ops under prefers-reduced-motion.
 */
export function RevealGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={groupContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={groupItem}>
      {children}
    </motion.div>
  );
}
