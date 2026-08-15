"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Whether an element is on screen right now.
 *
 * `useReveal` answers "has this arrived yet" once and then stops watching.
 * This keeps watching, for things that should run while they are being
 * looked at and hold still while they are not — an animation nobody can see
 * is a frame budget spent on nothing.
 *
 * It starts true and is corrected by the observer's first callback, so every
 * failure path — no observer, an element measured before layout, a browser
 * that never fires — lands on "running" rather than on a machine that never
 * starts.
 */
export function useOnScreen(
  ref: RefObject<HTMLElement | null>,
  rootMargin = "180px",
): boolean {
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry?.isIntersecting ?? true),
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return onScreen;
}
