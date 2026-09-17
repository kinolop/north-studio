"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import { PrintLines } from "@/components/motion/PrintLines";
import { TypeText } from "@/components/motion/TypeText";
import { Section } from "@/components/ui/Section";
import { cssColor } from "@/lib/cssColor";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * How it gets to you, drawn as a route.
 *
 * A cobalt line runs through the steps and is drawn by the scroll, so the
 * reader's position on the page is the pen's position on the route. Each
 * stop fills in as the line reaches it. On a phone the route turns
 * vertical and runs down the left edge.
 */
export function CaseSteps({
  id,
  title,
  items,
}: {
  id: string;
  title: readonly string[];
  items: readonly { key: string; name: string; body: string }[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const lines = gsap.utils.toArray<HTMLElement>("[data-route]", root);
        const stops = gsap.utils.toArray<HTMLElement>("[data-stop]", root);
        gsap.set(stops, { backgroundColor: cssColor("--color-paper", "#ecebe6") });
        lines.forEach((line) => {
          const vertical = line.dataset.route === "y";
          gsap.fromTo(
            line,
            vertical ? { scaleY: 0 } : { scaleX: 0 },
            {
              ...(vertical ? { scaleY: 1 } : { scaleX: 1 }),
              ease: "none",
              scrollTrigger: {
                trigger: root.querySelector("[data-track]"),
                start: "top 75%",
                end: "bottom 55%",
                scrub: 0.5,
              },
            },
          );
        });
        stops.forEach((stop) => {
          gsap.to(stop, {
            backgroundColor: cssColor("--color-cobalt", "#1b2ed8"),
            duration: 0.35,
            scrollTrigger: { trigger: stop, start: "top 62%", toggleActions: "play none none reverse" },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <Section id={id} flush className="py-band">
      <div ref={rootRef} className="sheet">
        <div className="border-t border-ink pt-8 lg:pt-10">
          <TypeText as="h2" lines={title} className="poster text-[clamp(3.6rem,9vw,9.5rem)] text-ink" />
        </div>

        <div data-track className="relative mt-14 lg:mt-20">
          {/* Horizontal route, desktop. */}
          <span aria-hidden className="absolute top-[7px] right-0 left-0 hidden h-px bg-rule lg:block" />
          <span
            aria-hidden
            data-route="x"
            className="absolute top-[6px] right-0 left-0 hidden h-[3px] origin-left bg-cobalt lg:block"
          />
          {/* Vertical route, phones. */}
          <span aria-hidden className="absolute top-0 bottom-0 left-[7px] w-px bg-rule lg:hidden" />
          <span
            aria-hidden
            data-route="y"
            className="absolute top-0 bottom-0 left-[6px] w-[3px] origin-top bg-cobalt lg:hidden"
          />

          <ol className="relative grid gap-12 pl-10 lg:grid-cols-4 lg:gap-8 lg:pl-0">
            {items.map((item) => (
              <li key={item.key} className="relative lg:pt-12">
                <span
                  data-stop
                  aria-hidden
                  className="absolute top-1 -left-10 h-4 w-4 border-[3px] border-cobalt bg-cobalt lg:top-0 lg:left-0"
                />
                <h3 className="text-[clamp(1.35rem,1.8vw,1.75rem)] leading-[1.1] font-bold text-ink">
                  {item.name}
                </h3>
                <PrintLines text={item.body} className="mt-3 max-w-[34ch] text-copy text-ink-soft" />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
