"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll parallax for a single element, measured rather than guessed.
 *
 * The element's own travel is derived from where it sits in the viewport,
 * so it works the same whether the page is scrolled by Lenis, by a wheel,
 * by a keyboard or by a scrollbar drag - nothing here listens for a scroll
 * event or reads a scroll position.
 *
 * The loop only runs while the element is on screen. Off screen the
 * observer cancels the frame, so a page with eight parallax plates on it is
 * still only ever animating the one or two you can see.
 */
export function useNocturaParallax<T extends HTMLElement = HTMLDivElement>(
  /** Total travel in px, split evenly above and below centre. */
  strength = 28,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let running = false;

    const tick = () => {
      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight;
      // 0 as the element enters from the bottom, 1 as it leaves the top.
      const raw = (viewport - rect.top) / (viewport + rect.height);
      const progress = raw < 0 ? 0 : raw > 1 ? 1 : raw;
      const y = (progress - 0.5) * strength;
      element.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      if (running) frame = window.requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = Boolean(entry?.isIntersecting);
        if (visible === running) return;
        running = visible;
        window.cancelAnimationFrame(frame);
        if (visible) frame = window.requestAnimationFrame(tick);
      },
      { rootMargin: "15% 0px" },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [strength]);

  return ref;
}
