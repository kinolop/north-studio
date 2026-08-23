"use client";

import Image from "next/image";

import { useCopy } from "@/components/i18n/CopyProvider";
import { MONOLITH, MONOLITH_IMAGES } from "@/lib/monolith";

import { MonolithLocale } from "./MonolithLocale";

/**
 * The hero, and the page's one instruction to the reader: this surface is
 * concrete and the words are cut into it.
 *
 * The wordmark is sized to overrun the viewport, not to fit it — the M and
 * the H run off both edges, so what you see is a fragment of something that
 * continues past the screen. It is the practice's name and the page's only
 * h1, so it stays real text; `overflow-hidden` on the band does the cutting.
 *
 * The photograph is the ground rather than the subject. It sits under a
 * flat scrim of the page's own concrete tone: a debossed letter reads by its
 * shadow and its lit lip, and both of those are destroyed by a busy
 * backdrop. At this weight the building is still legible behind the word and
 * the surface is near-uniform enough to press into. Flat colour at alpha,
 * not a gradient — nothing on this page fades from one colour to another.
 */
export function MonolithHero() {
  const copy = useCopy().monolithCase;

  return (
    <section className="mn-s-90 mn-on-photo-90 relative flex min-h-[100svh] flex-col overflow-hidden">
      <Image
        src={MONOLITH_IMAGES.hero}
        alt={copy.hero.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* The scrim. Solid --m-90 at 0.78: enough to flatten the sky and the
          wall into one pour, not enough to erase the building. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: "rgb(233 231 227 / 0.78)" }}
      />

      {/* The only chrome on the page, and it scrolls away with the hero
          rather than following you down — see MonolithLocale for why there
          is no fixed bar. The demo tag is here because a page presenting an
          invented practice should say so before it says anything else. */}
      <div className="mn-wrap relative flex items-start justify-between gap-6 pt-[clamp(1.5rem,4vh,2.75rem)]">
        <p className="mn-mono mn-deboss-fine">{copy.demoTag}</p>
        <MonolithLocale />
      </div>

      <div className="relative flex flex-1 flex-col justify-end pb-[clamp(2.5rem,7vh,5.5rem)]">
        <h1 className="mn-wordmark mn-deboss" aria-label={MONOLITH.wordmark}>
          {MONOLITH.wordmark}
        </h1>

        <div className="mn-wrap mt-[clamp(1.5rem,4vh,3rem)]">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
            <p className="mn-mono-lg mn-deboss-fine">{copy.hero.line}</p>

            {/* The stamp. The one burgundy on the page, set off its axis the
                way a rubber seal lands on a drawing — never quite square. */}
            <p
              className="mn-mono mn-seal shrink-0 text-right leading-[1.9]"
              style={{ transform: "rotate(-3.2deg)" }}
            >
              {copy.hero.stamp.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>

          <div aria-hidden className="mn-groove mt-[clamp(1.5rem,4vh,2.5rem)]" />
        </div>
      </div>
    </section>
  );
}
