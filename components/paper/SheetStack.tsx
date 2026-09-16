"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * A new sheet laid over the last one.
 *
 * The first screen holds still while the rest of the page slides up over it
 * like the next page of a pad, casting a soft edge of shadow. As it is
 * covered, the page underneath sinks a little and dims, which is what sells
 * the depth. Desktop only: on a phone the first screen can be taller than
 * the window, and pinning it would hide its own end.
 */
export function SheetStack({ under, over }: { under: ReactNode; over: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const base = root.querySelector<HTMLElement>("[data-under]");
        const shade = root.querySelector<HTMLElement>("[data-shade]");
        const cover = root.querySelector<HTMLElement>("[data-over]");
        if (!base || !shade || !cover) return;
        gsap
          .timeline({
            scrollTrigger: { trigger: cover, start: "top bottom", end: "top top", scrub: true },
          })
          .fromTo(base, { scale: 1, yPercent: 0 }, { scale: 0.92, yPercent: -4, ease: "none" }, 0)
          .fromTo(shade, { opacity: 0 }, { opacity: 0.22, ease: "none" }, 0);
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="relative">
      <div className="relative z-0 lg:sticky lg:top-0">
        <div data-under className="origin-top">
          {under}
        </div>
        <div data-shade aria-hidden className="pointer-events-none absolute inset-0 bg-ink opacity-0" />
      </div>
      <div
        data-over
        className="relative z-10 bg-paper shadow-[0_-28px_60px_-34px_rgb(18_18_17/0.55)]"
      >
        {over}
      </div>
    </div>
  );
}
