"use client";

import Image from "next/image";
import { useRef } from "react";

import { DitherLayer } from "@/components/atmosphere/DitherLayer";
import { useCopy } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { sectionById } from "@/lib/sections";
import { useReveal } from "@/lib/useReveal";

const meta = sectionById("founder");

/** Slat count. Odd numbers avoid a seam landing dead centre. */
const SLATS = 9;

/**
 * Drop a file here and the frame switches from placeholder to portrait.
 * Recommended 4:5, dark and cinematic so it sits inside the page's light.
 */
const PORTRAIT_SRC: string | null = null;

/**
 * Task F — the trust section.
 *
 * Two motifs meet here. The portrait is revealed through vertical slats
 * that open in sequence (mechanical, like a shutter), and the surface they
 * open onto resolves out of the dither field rather than simply fading. A
 * plain fade would have been half the code and none of the character.
 */
export function Founder() {
  const copy = useCopy();
  const frameRef = useRef<HTMLDivElement>(null);
  const phase = useReveal(frameRef);
  const open = phase !== "armed";

  return (
    <Section id={meta.id}>
      <div className="container-north grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div
            ref={frameRef}
            className="relative mx-auto w-full max-w-[22rem] overflow-hidden rounded-[var(--radius-plate)] border border-hairline bg-abyss lg:mx-0"
            style={{ aspectRatio: "4 / 5" }}
          >
            {PORTRAIT_SRC ? (
              <Image
                src={PORTRAIT_SRC}
                alt={copy.founder.signature}
                fill
                sizes="(max-width: 1024px) 80vw, 24rem"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(155deg,#141924_0%,#0a0d13_58%,#10151f_100%)]" />
                {/* Graded, not even: dense at the foot and clearing toward the top,
                    so the plate reads as resolving out of the dither rather than
                    sitting under a checkerboard. */}
                <DitherLayer
                  level={0.4}
                  scale={2}
                  opacity={0.16}
                  className="[mask-image:linear-gradient(to_top,black,transparent_78%)]"
                />
                <div className="absolute inset-0 bg-[radial-gradient(58%_44%_at_50%_28%,rgb(109_92_255/0.16),transparent_72%)]" />

                {/* The instruction lives inside the frame, so there is no way
                    to ship this without having seen it. */}
                <p className="absolute inset-x-6 bottom-6 font-mono text-[0.625rem] leading-[1.7] tracking-[0.14em] text-ash uppercase">
                  {copy.founder.portraitNote}
                </p>

                {/* Corner marks, same language as the case plates. */}
                {(
                  [
                    "top-4 left-4 border-t border-l",
                    "top-4 right-4 border-t border-r",
                    "bottom-4 left-4 border-b border-l",
                    "bottom-4 right-4 border-b border-r",
                  ] as const
                ).map((position) => (
                  <span
                    key={position}
                    aria-hidden
                    className={`absolute h-4 w-4 border-white/12 ${position}`}
                  />
                ))}
              </div>
            )}

            {/* The shutter. Slats sit closed until the frame is scrolled to,
                then lift one after another. Pointer-events off so they never
                intercept a click on the image beneath. */}
            <div aria-hidden className="pointer-events-none absolute inset-0 flex">
              {Array.from({ length: SLATS }, (_, i) => (
                <span
                  key={i}
                  className="h-full flex-1 origin-top bg-void transition-transform duration-[900ms] ease-[var(--ease-north)] motion-reduce:transition-none"
                  style={{
                    transform: open ? "scaleY(0)" : "scaleY(1)",
                    transitionDelay: `${i * 70}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />

          <SplitLines
            as="h2"
            lines={copy.founder.title}
            className="mt-8 text-display font-display font-medium text-bone"
          />

          <div className="mt-9 max-w-[52ch] space-y-6">
            {copy.founder.body.map((paragraph, index) => (
              <Reveal key={paragraph.slice(0, 24)} delay={index * 0.06}>
                <p className={index === 0 ? "text-lead text-bone" : "text-body text-ash"}>
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.14}>
            <p className="label-mono mt-10 flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-hairline" />
              {copy.founder.signature}
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
