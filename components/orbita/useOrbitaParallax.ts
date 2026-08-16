"use client";

import { useEffect, type RefObject } from "react";

/**
 * A few pixels of drift, shared by every element that wants it.
 *
 * One scroll listener and one animation frame for the whole page, no matter
 * how many backdrops register: each element is measured inside a single
 * coalesced frame and written with a transform, so nothing here touches
 * layout or paint. Elements outside the viewport are skipped entirely.
 *
 * Reduced motion never registers, which is also why the CSS drops the
 * backdrop's scale in that case — a scaled image with nothing moving it
 * would just be a crop.
 */
const registry = new Map<HTMLElement, number>();
let frame = 0;
let listening = false;

function paint() {
  frame = 0;
  const viewport = window.innerHeight || 1;

  for (const [element, strength] of registry) {
    const rect = element.getBoundingClientRect();
    if (rect.bottom < -200 || rect.top > viewport + 200) continue;

    // -1 at the bottom of the screen, +1 at the top, 0 dead centre.
    const centre = rect.top + rect.height / 2;
    const progress = (centre - viewport / 2) / (viewport / 2 + rect.height / 2);
    const offset = (progress * strength).toFixed(2);

    element.style.transform = `translate3d(0, ${offset}px, 0) scale(1.12)`;
  }
}

function schedule() {
  if (frame === 0) frame = window.requestAnimationFrame(paint);
}

export function useOrbitaParallax(
  ref: RefObject<HTMLElement | null>,
  strength = 26,
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    registry.set(element, strength);

    if (!listening) {
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      listening = true;
    }
    schedule();

    return () => {
      registry.delete(element);
      element.style.transform = "";

      if (registry.size === 0 && listening) {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        listening = false;
      }
    };
  }, [ref, strength]);
}
