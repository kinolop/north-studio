"use client";

import {
  useEffect,
  useLayoutEffect,
  useState,
  type RefObject,
} from "react";

import { useReducedMotion } from "./useReducedMotion";

export type RevealPhase = "idle" | "armed" | "in";

interface RevealOptions {
  /** "mount" animates immediately (above-the-fold); "inView" waits. */
  mode?: "mount" | "inView";
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Scroll reveals that cannot strand content.
 *
 * The naive approach — render at opacity 0 and let an IntersectionObserver
 * bring it in — has a failure mode that ships silently: if the page loads
 * already scrolled (a #hash link, a mid-page reload, browser scroll
 * restoration), everything sitting in the viewport at mount never receives
 * an intersection callback and stays invisible forever.
 *
 * So the logic is inverted. Content renders *visible*, and JavaScript hides
 * it only after confirming it is genuinely below the fold and that motion
 * is wanted. That hiding happens in a layout effect, before paint, so there
 * is no flash. Every failure path — no JS, no observer, reduced motion,
 * deep link — lands on "content is visible", which is the only acceptable
 * way for a reveal to fail.
 *
 * It also fixes something subtler: elements already on screen no longer
 * animate at all. Animating what the visitor is already looking at is one
 * of the clearest tells of a generated page.
 */
export function useReveal(
  ref: RefObject<HTMLElement | null>,
  { mode = "inView" }: RevealOptions = {},
): RevealPhase {
  const [phase, setPhase] = useState<RevealPhase>("idle");
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element || reduced) return;

    if (mode === "mount") {
      setPhase("armed");
      const id = window.requestAnimationFrame(() => setPhase("in"));
      return () => window.cancelAnimationFrame(id);
    }

    // Already on screen: leave it alone.
    if (element.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    setPhase("armed");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setPhase("in");
        observer.disconnect();
      },
      // threshold 0 with a negative bottom margin, so sections taller than
      // the viewport still trigger — a fractional threshold never would.
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, mode, reduced]);

  return reduced ? "idle" : phase;
}
