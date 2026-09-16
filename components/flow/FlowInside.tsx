"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { PrintLines } from "@/components/motion/PrintLines";
import { TypeText } from "@/components/motion/TypeText";
import { Section } from "@/components/ui/Section";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * What the line takes off your hands, as a checklist ticked off by hand.
 * The title holds the left margin; each job gets its own row and its own
 * cobalt tick, drawn as the row reaches the reading line.
 */
export function FlowInside() {
  const copy = useCopy();
  const inside = copy.flowCase.inside;
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<SVGPathElement>("[data-tick]", root).forEach((tick) => {
          const length = tick.getTotalLength();
          gsap.fromTo(
            tick,
            { strokeDasharray: length, strokeDashoffset: length },
            {
              strokeDashoffset: 0,
              duration: 0.7,
              ease: "power2.inOut",
              scrollTrigger: { trigger: tick, start: "top 78%", once: true },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <Section id="flow-inside" flush className="py-band">
      <div ref={rootRef} className="sheet">
        <div className="sheet-grid gap-y-10 border-t border-ink pt-8 lg:pt-10">
          <div className="col-span-12 lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <TypeText as="h2" lines={inside.title} className="poster text-[clamp(3.4rem,7.6vw,8rem)] text-ink" />
            </div>
          </div>

          <ul className="col-span-12 lg:col-span-7">
            {inside.items.map((item, i) => (
              <li
                key={item.key}
                className={`grid grid-cols-[3rem_1fr] gap-x-5 py-7 sm:grid-cols-[3.5rem_1fr_1fr] sm:gap-x-8 ${i > 0 ? "border-t border-rule" : ""}`}
              >
                <svg aria-hidden viewBox="0 0 48 40" className="h-9 w-11 overflow-visible">
                  <path
                    data-tick
                    d={i % 2 === 0 ? "M4 22 C 9 26, 12 31, 15 34 C 22 22, 32 11, 44 4" : "M3 20 C 8 25, 13 30, 16 33 C 24 20, 33 12, 45 6"}
                    fill="none"
                    stroke="var(--color-cobalt)"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h3 className="text-[clamp(1.3rem,1.8vw,1.7rem)] leading-[1.15] font-bold text-ink">{item.name}</h3>
                <PrintLines text={item.body} className="col-start-2 mt-2 text-copy text-ink-soft sm:col-start-3 sm:mt-0" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
