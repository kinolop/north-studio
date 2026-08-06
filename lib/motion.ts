import type { Transition } from "framer-motion";

/**
 * One easing vocabulary, shared by CSS, Framer Motion and GSAP so the whole
 * site moves with the same weight. `north` is expo-out: slow out, heavy,
 * never bouncy. Nothing here is linear.
 */
export const EASE = {
  /** Primary. Entrances, reveals, anything that should feel inevitable. */
  north: [0.16, 1, 0.3, 1],
  /** Symmetric. State changes that go both ways (accordions, toggles). */
  glide: [0.65, 0, 0.35, 1],
  /** Sharp in, sharp out. Curtains and masks. */
  mask: [0.76, 0, 0.24, 1],
} as const satisfies Record<string, [number, number, number, number]>;

export const GSAP_EASE = {
  north: "expo.out",
  glide: "power3.inOut",
  mask: "power4.inOut",
} as const;

export const DURATION = {
  tap: 0.18,
  state: 0.32,
  reveal: 0.9,
  curtain: 1.2,
} as const;

/** Standard entrance for a block of content. */
export const revealTransition: Transition = {
  duration: DURATION.reveal,
  ease: EASE.north,
};
