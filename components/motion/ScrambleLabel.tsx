"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrambleTextPlugin, ScrollTrigger, useGSAP);

const CYRILLIC = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ0123456789";
const LATIN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Small print that decodes itself: a label arrives as a line of random
 * type-case letters that settle, left to right, into the real words. Kept
 * for the mono labels only; on anything longer it would stop being read.
 */
export function ScrambleLabel({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(el, {
          duration: Math.min(1.8, 0.5 + text.length * 0.045),
          ease: "none",
          scrambleText: {
            text,
            chars: /[а-яё]/i.test(text) ? CYRILLIC : LATIN,
            revealDelay: 0.25,
            speed: 0.55,
          },
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [text] },
  );

  // Keyed by the text: GSAP rewrites the node's contents, so a language
  // switch has to mount a fresh span rather than patch one React no longer
  // owns.
  return (
    <span key={text} ref={ref} className={className} aria-label={text}>
      {text}
    </span>
  );
}
