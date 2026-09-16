"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { TypeText } from "@/components/motion/TypeText";
import { Section } from "@/components/ui/Section";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Three hand-drawn ticks, so no two look stamped from the same die. */
const TICKS = [
  "M4 22 C 9 26, 12 31, 15 34 C 22 22, 32 11, 44 4",
  "M3 20 C 8 25, 13 30, 16 33 C 24 20, 33 12, 45 6",
  "M5 23 C 9 27, 12 30, 14 35 C 21 23, 31 12, 43 3",
];

/**
 * Who is behind the studio, in his own words.
 *
 * The statement inks in word by word as it is read, scrubbed to scroll so
 * the page keeps the reader's pace, and is signed by hand. The three
 * promises underneath are ticked off with the same cobalt pen as they come
 * into view: not icons, marks someone made.
 */
export function About() {
  const copy = useCopy();
  const about = copy.about;
  const rootRef = useRef<HTMLDivElement>(null);
  const words = about.statement.split(" ");

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const text = root.querySelector<HTMLElement>("[data-statement]");
        if (text) {
          gsap.fromTo(
            text.querySelectorAll<HTMLElement>("[data-word]"),
            { opacity: 0.12 },
            {
              opacity: 1,
              ease: "none",
              stagger: 0.08,
              scrollTrigger: { trigger: text, start: "top 78%", end: "bottom 40%", scrub: 0.6 },
            },
          );
        }

        gsap.utils.toArray<SVGPathElement>("[data-tick]", root).forEach((tick, i) => {
          const length = tick.getTotalLength();
          gsap.fromTo(
            tick,
            { strokeDasharray: length, strokeDashoffset: length },
            {
              strokeDashoffset: 0,
              duration: 0.8,
              delay: i * 0.25,
              ease: "power2.inOut",
              scrollTrigger: { trigger: tick, start: "top 85%", once: true },
            },
          );
        });

        const signature = root.querySelector<HTMLElement>("[data-signature]");
        if (signature) {
          gsap.fromTo(
            signature,
            { clipPath: "inset(-20% 100% -20% -5%)" },
            {
              clipPath: "inset(-20% -5% -20% -5%)",
              duration: 1.6,
              ease: "power2.inOut",
              scrollTrigger: { trigger: signature, start: "top 85%", once: true },
            },
          );
        }
      });
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [about] },
  );

  return (
    <Section id="about" flush className="py-band">
      <div ref={rootRef} className="sheet">
        <div className="flex flex-wrap items-end justify-between gap-6 border-t border-ink pt-8 lg:pt-10">
          <TypeText
            as="h2"
            lines={about.title}
            className="poster text-[clamp(3.4rem,7vw,7.5rem)] text-ink"
          />
          <p
            data-signature
            aria-hidden
            className="font-[family-name:var(--font-hand)] text-[clamp(4rem,8vw,8rem)] leading-none font-semibold text-cobalt lg:mr-[6vw]"
            style={{ transform: "rotate(-6deg)" }}
          >
            {about.signature}
          </p>
        </div>

        <p
          data-statement
          className="mt-12 max-w-[34ch] text-[clamp(1.8rem,3.4vw,3.6rem)] leading-[1.1] font-semibold tracking-[-0.025em] text-ink lg:mt-16"
        >
          {words.map((word, index) => (
            <span key={`${word}-${index}`} data-word>
              {word}
              {index < words.length - 1 ? " " : ""}
            </span>
          ))}
        </p>

        <ul className="mt-16 grid gap-y-10 sm:grid-cols-3 sm:gap-x-10 lg:mt-24">
          {about.principles.map((principle, index) => (
            <li key={principle.key} className="grid grid-cols-[3rem_1fr] gap-x-4">
              <svg aria-hidden viewBox="0 0 48 40" className="h-10 w-12 overflow-visible">
                <path
                  data-tick
                  d={TICKS[index % TICKS.length]}
                  fill="none"
                  stroke="var(--color-cobalt)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <p className="text-[clamp(1.35rem,1.8vw,1.7rem)] leading-tight font-bold text-ink">
                  {principle.term}
                </p>
                <p className="mt-2 text-copy text-ink-soft">{principle.definition}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
