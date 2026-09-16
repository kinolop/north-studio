"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { PrintLines } from "@/components/motion/PrintLines";
import { TypeText } from "@/components/motion/TypeText";
import { Section } from "@/components/ui/Section";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const IMAGES: Record<"answers" | "knows" | "enroll", string> = {
  answers: "/work/north-agent/assets/cap-answers.png",
  knows: "/work/north-agent/assets/cap-knows.png",
  enroll: "/work/north-agent/assets/cap-enroll.png",
};

/** Each photograph sits at its own height, so the row reads as a spread, not a grid. */
const OFFSETS = ["lg:mt-0", "lg:mt-32", "lg:mt-14"];

/**
 * What the agent does, as three photographs of it doing it. Each picture is
 * uncovered from the bottom edge as it scrolls in and drifts a little
 * slower than the page, so the paper it was shot on seems to lie under the
 * page's own paper.
 */
export function AgentCapabilities() {
  const copy = useCopy();
  const capabilities = copy.agentCase.capabilities;
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-plate]", root).forEach((plate) => {
          const picture = plate.querySelector<HTMLElement>("[data-picture]");
          gsap.fromTo(
            plate,
            { clipPath: "inset(100% 0% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.4,
              ease: "expo.out",
              scrollTrigger: { trigger: plate, start: "top 85%", once: true },
            },
          );
          if (picture) {
            gsap.fromTo(
              picture,
              { yPercent: -6, scale: 1.12 },
              {
                yPercent: 6,
                scale: 1.12,
                ease: "none",
                scrollTrigger: { trigger: plate, start: "top bottom", end: "bottom top", scrub: true },
              },
            );
          }
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <Section id="agent-capabilities" flush className="py-band">
      <div ref={rootRef} className="sheet">
        <div className="border-t border-ink pt-8 lg:pt-10">
          <TypeText as="h2" lines={capabilities.title} className="poster text-[clamp(3.6rem,9vw,9.5rem)] text-ink" />
        </div>

        <ul className="mt-14 grid gap-14 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-8">
          {capabilities.items.map((item, index) => (
            <li key={item.key} className={OFFSETS[index] ?? ""}>
              <div data-plate className="relative aspect-[4/5] overflow-hidden bg-paper-deep">
                <div data-picture className="absolute inset-0">
                  <Image
                    src={IMAGES[item.key]}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <h3 className="mt-6 text-[clamp(1.4rem,1.9vw,1.85rem)] leading-[1.1] font-bold text-ink">{item.name}</h3>
              <PrintLines text={item.body} className="mt-3 max-w-[38ch] text-copy text-ink-soft" />
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
