"use client";

import { useEffect, useRef } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { subscribeScroll } from "@/lib/scroll";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Pixels per frame at rest; scrolling adds to it. */
const DRIFT = 0.55;

/**
 * Two strips of tape across the page, crossing.
 *
 * The cobalt strip carries what I do, the ink strip underneath carries what
 * you get; they run in opposite directions, pick up speed while the page is
 * scrolled and swap direction when the scroll does. One animation frame
 * loop for both, and only while the tape is on screen.
 */
export function TapeMarquee() {
  const copy = useCopy();
  const reduced = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const items = copy.marquee.items;
  const top = items.filter((_, i) => i % 2 === 0).concat(items.filter((_, i) => i % 2 === 1));
  const bottom = [...items].reverse();

  useEffect(() => {
    const box = boxRef.current;
    const a = topRef.current;
    const b = bottomRef.current;
    if (!box || !a || !b || reduced) return;

    let offset = 0;
    let boost = 0;
    let direction = 1;
    let visible = false;
    let frame = 0;
    let widthA = a.scrollWidth / 2;
    let widthB = b.scrollWidth / 2;

    const tick = () => {
      frame = 0;
      if (!visible) return;
      offset += (DRIFT + boost) * direction;
      boost *= 0.92;
      const xa = -(((offset % widthA) + widthA) % widthA);
      const xb = (((offset * 0.8) % widthB) + widthB) % widthB;
      a.style.transform = `translate3d(${xa}px,0,0)`;
      b.style.transform = `translate3d(${xb - widthB}px,0,0)`;
      frame = window.requestAnimationFrame(tick);
    };

    const seen = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible && !frame) frame = window.requestAnimationFrame(tick);
    });
    seen.observe(box);

    const resize = new ResizeObserver(() => {
      widthA = a.scrollWidth / 2;
      widthB = b.scrollWidth / 2;
    });
    resize.observe(a);

    const stop = subscribeScroll(({ velocity }) => {
      if (Math.abs(velocity) > 0.5) direction = velocity > 0 ? 1 : -1;
      boost = Math.min(Math.abs(velocity) * 0.35, 14);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      seen.disconnect();
      resize.disconnect();
      stop();
    };
  }, [reduced, items]);

  const strip = (list: readonly string[], mark: string) =>
    [0, 1].map((copyIndex) => (
      <span key={copyIndex} aria-hidden={copyIndex === 1} className="flex shrink-0 items-center">
        {list.map((item) => (
          <span key={`${copyIndex}-${item}`} className="flex items-center">
            <span className="px-[0.45em]">{item}</span>
            <span aria-hidden className={`inline-block h-[0.32em] w-[0.32em] ${mark}`} />
          </span>
        ))}
      </span>
    ));

  return (
    <div
      ref={boxRef}
      className="relative h-[clamp(10rem,19vw,17rem)] overflow-hidden"
      aria-label={items.join(". ")}
      role="region"
    >
      <div className="absolute top-1/2 -left-[5%] w-[110%] -translate-y-1/2 rotate-[2.2deg] bg-ink py-[0.55em] text-[clamp(1.6rem,3vw,3rem)] text-paper">
        <div ref={bottomRef} className="poster flex w-max leading-none will-change-transform">
          {strip(bottom, "bg-cobalt")}
        </div>
      </div>
      <div className="absolute top-1/2 -left-[5%] w-[110%] -translate-y-1/2 -rotate-[3deg] bg-cobalt py-[0.5em] text-[clamp(2rem,4.2vw,4.4rem)] text-paper shadow-[0_18px_40px_-24px_rgb(18_18_17/0.45)]">
        <div ref={topRef} className="poster flex w-max leading-none will-change-transform">
          {strip(top, "bg-paper")}
        </div>
      </div>
    </div>
  );
}
