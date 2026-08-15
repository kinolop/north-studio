"use client";

import { useEffect, useState, type RefObject } from "react";

import { useReducedMotion } from "./useReducedMotion";
import { useReveal } from "./useReveal";

const COUNT_MS = 1100;

/** Expo-out, matching the site's easing rather than counting linearly. */
const ease = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

interface CountUpOptions {
  /** Milliseconds to hold after the figure arrives, for staggering a row. */
  delay?: number;
  decimals?: number;
  /** False for figures that are not quantities — "24/7" counts to nothing. */
  enabled?: boolean;
}

/**
 * A number that counts up once, when it is looked at.
 *
 * Every failure path resolves to the final value: reduced motion, a figure
 * that is a literal rather than a quantity, a page that loaded already
 * scrolled past. A counter stuck on zero is worse than one that never
 * animated, so zero is only ever a starting point, never a resting state.
 */
export function useCountUp(
  target: number,
  ref: RefObject<HTMLElement | null>,
  { delay = 0, decimals = 0, enabled = true }: CountUpOptions = {},
): number {
  const phase = useReveal(ref);
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(target);

  useEffect(() => {
    if (!enabled || reduced || phase === "armed") {
      setShown(target);
      return;
    }

    const quantum = 10 ** decimals;
    let rafId = 0;
    let start = 0;

    const frame = (now: number) => {
      if (start === 0) start = now;
      const t = Math.min((now - start) / COUNT_MS, 1);
      setShown(Math.round(ease(t) * target * quantum) / quantum);
      if (t < 1) rafId = window.requestAnimationFrame(frame);
    };

    const delayTimer = window.setTimeout(() => {
      rafId = window.requestAnimationFrame(frame);
    }, delay);

    return () => {
      window.clearTimeout(delayTimer);
      window.cancelAnimationFrame(rafId);
    };
  }, [target, delay, decimals, enabled, reduced, phase]);

  return shown;
}
