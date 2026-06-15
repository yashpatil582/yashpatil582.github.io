import type { Variants } from "motion/react";

/**
 * Shared motion constants so every animated surface reads as one system.
 * EASE_REVEAL: expo-out for entrances/reveals. EASE_MICRO: standard curve for
 * hover/press micro-interactions.
 */
export const EASE_REVEAL: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_MICRO: [number, number, number, number] = [0.4, 0, 0.2, 1];

/** Stagger container + item used by RevealGroup / RevealItem and the hero "boot". */
export const groupContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

export const groupItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_REVEAL } },
};
