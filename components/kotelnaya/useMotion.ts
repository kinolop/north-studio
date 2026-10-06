"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useEffect, type RefObject } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * The page's three ways of arriving, wired once for everything inside
 * `scope`:
 *
 * - `data-kt-split` headings rise line by line out of their own masks, the
 *   way a printed line is pulled out of the press, once, when they come
 *   into view;
 * - `data-kt-reveal` frames open from the bottom edge and the photograph
 *   inside settles from a slight push-in;
 * - `data-kt-speed="n"` frames let their photograph drift n% against the
 *   scroll, which is what gives a collage its depth.
 *
 * Under reduced motion none of it is set up and everything simply stands.
 */
export function useKtMotion(scope: RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = scope.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>("[data-kt-split]").forEach((el) => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: 1.2,
              ease: "expo.out",
              stagger: 0.09,
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            }),
        });
      });

      root.querySelectorAll<HTMLElement>("[data-kt-reveal]").forEach((el) => {
        const img = el.querySelector("img");
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 90%", once: true } });
        tl.fromTo(
          el,
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" },
        );
        if (img) tl.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 2, ease: "expo.out" }, 0.1);
      });

      root.querySelectorAll<HTMLElement>("[data-kt-speed]").forEach((el) => {
        const img = el.querySelector("img");
        const speed = Number(el.dataset.ktSpeed) || 10;
        if (!img) return;
        gsap.set(img, { scale: 1 + Math.abs(speed) / 50 });
        gsap.fromTo(
          img,
          { yPercent: -speed / 2 },
          {
            yPercent: speed / 2,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    }, root);

    return () => ctx.revert();
  }, [scope, reduced]);
}
