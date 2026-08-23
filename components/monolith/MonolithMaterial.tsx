"use client";

import Image from "next/image";

import { useCopy } from "@/components/i18n/CopyProvider";
import { MONOLITH_IMAGES } from "@/lib/monolith";

import { MonolithReveal } from "./MonolithReveal";

/**
 * The material itself, full bleed, with the argument for it pressed on top.
 *
 * This is the one place on the page where the photograph is the subject
 * rather than the ground, so the scrim over it is lighter than the hero's —
 * you are meant to be able to count the board marks and the tie holes the
 * sentence is talking about.
 *
 * That leaves the display line sitting on a genuinely uneven surface, which
 * is where a deboss usually falls apart. It survives here because the scrim
 * is the section's own pour rather than a wash of grey, and because the
 * reading paragraph beneath it is not debossed at all: it is flat --m-ink
 * over the same scrim, at better than 8:1. The pressed line carries the
 * material; the flat one carries the meaning.
 */
export function MonolithMaterial() {
  const copy = useCopy().monolithCase;

  return (
    <section className="mn-s-75 mn-on-photo-75 relative flex min-h-[100svh] items-center overflow-hidden">
      <Image
        src={MONOLITH_IMAGES.material}
        alt={copy.material.alt}
        fill
        loading="lazy"
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* 0.84, and every point of that was bought rather than chosen.
          Board-formed concrete has near-black lines between the boards and
          near-black tie holes, and sampled through a 0.72 scrim they pulled
          the ground under the display line to rgb(146 142 137) — 2.4:1,
          which is a failing line of type however good the picture looks. The
          alternative was to drop the recess face until it stopped reading as
          a recess and started reading as ordinary dark text, which would
          have cost the section the one thing it is for. This keeps the grain
          and the tie holes plainly visible and puts the display at 3.3:1 and
          the mono at 4.6:1 on the worst pixel under either. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: "rgb(201 197 190 / 0.84)" }}
      />

      <div className="mn-wrap mn-section relative w-full">
        <MonolithReveal distance={0}>
          <p className="mn-mono mn-deboss-fine">{copy.material.label}</p>
        </MonolithReveal>

        <MonolithReveal delay={120}>
          <p className="mn-display mn-deboss mt-[clamp(2rem,6vh,3.5rem)] max-w-[19ch]">
            {copy.material.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </MonolithReveal>

        <MonolithReveal delay={200}>
          <p className="mn-body mt-[clamp(2rem,5vh,3rem)] max-w-[54ch]">
            {copy.material.body}
          </p>
        </MonolithReveal>
      </div>
    </section>
  );
}
