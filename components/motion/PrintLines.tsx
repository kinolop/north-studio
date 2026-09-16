"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { createElement, useRef } from "react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

type Tag = "p" | "div" | "span" | "dd" | "li";

/**
 * A paragraph that comes off the press one line at a time.
 *
 * The text is split into its real, measured lines (re-measured when fonts
 * land or the column changes width), and each line rises out of its own
 * mask with a pause between them long enough to see the order. Paragraphs
 * print line by line rather than letter by letter on purpose: a heading can
 * afford to be watched, a paragraph has to stay readable.
 *
 * `delay` holds the first line; `start` moves the trigger up or down the
 * screen. Nothing is hidden until GSAP is running and motion is allowed.
 */
export function PrintLines({
  text,
  as = "p",
  className,
  delay = 0,
  start = "top 80%",
}: {
  text: string;
  as?: Tag;
  className?: string;
  delay?: number;
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.lines, {
              yPercent: 118,
              duration: 1.25,
              ease: "expo.out",
              stagger: 0.16,
              delay,
              scrollTrigger: { trigger: el, start, once: true },
            });
          },
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [text], revertOnUpdate: true },
  );

  // Keyed by the text: SplitText rewrites the element's insides, so a new
  // text (a language switch, often right after hydration) gets a fresh
  // element rather than React patching markup it no longer owns, and the
  // old split's revert lands on the element being thrown away.
  return createElement(as, { ref, className, key: text }, text);
}
