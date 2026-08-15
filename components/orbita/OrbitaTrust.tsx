"use client";

import { useCopy } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Figure } from "@/components/ui/Figure";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { orbitaSectionById } from "@/lib/sections";
import { useLitPanel } from "@/lib/useLitPanel";

import { OrbitaMark } from "./OrbitaMark";

const meta = orbitaSectionById("orbita-trust");

/**
 * How it feels to hand a product your money.
 *
 * The disclaimer sits above the figures, in the same eyeline — a number on
 * a studio site is read as a claim about a real client unless it is told
 * otherwise in the same glance, and these belong to a company that does not
 * exist at all.
 */
type TrustItem = ReturnType<typeof useCopy>["orbitaCase"]["trust"]["items"][number];

/** Lit in ORBITA's cyan rather than the studio's violet — same system, one
 *  variable. A card on this page that glowed violet would give the game
 *  away faster than any amount of copy. */
function TrustCard({ item, index }: { item: TrustItem; index: number }) {
  const lit = useLitPanel<HTMLElement>();

  return (
    <Reveal delay={index * 0.08} className="h-full">
      <article
        ref={lit.ref}
        {...lit.props}
        className="lit-panel group flex h-full flex-col rounded-[var(--radius-plate)] border border-orbita/20 bg-[linear-gradient(180deg,rgb(13_58_68/0.28),rgb(7_8_11/0.6))] p-7 hover:border-orbita/45 lg:p-8 [--lit-hue:166_236_245]"
      >
        <OrbitaMark className="h-5 w-5 opacity-70 transition-opacity duration-[var(--duration-state)] group-hover:opacity-100" />
        <h3 className="mt-7 font-display text-[1.2rem] leading-[1.15] font-semibold tracking-[-0.03em] text-bone [font-variation-settings:'wdth'_92]">
          {item.name}
        </h3>
        <p className="mt-4 text-body text-ash">{item.body}</p>
      </article>
    </Reveal>
  );
}

export function OrbitaTrust() {
  const copy = useCopy();
  const trust = copy.orbitaCase.trust;

  return (
    <Section id={meta.id} className="overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[60%] bg-[radial-gradient(50%_60%_at_50%_0%,rgb(78_201_220/0.09),transparent_72%)]"
      />

      <div className="container-north relative">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
            <SplitLines
              as="h2"
              lines={trust.title}
              className="mt-8 font-display text-[clamp(1.6rem,3vw,2.8rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-bone [font-variation-settings:'wdth'_92]"
            />
          </div>
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.08}>
            <p className="max-w-[38ch] text-body text-ash">{trust.lede}</p>
          </Reveal>
        </div>

        <div className="mt-20 grid gap-5 lg:grid-cols-3">
          {trust.items.map((item, index) => (
            <TrustCard key={item.key} item={item} index={index} />
          ))}
        </div>

        <Reveal className="mt-20" delay={0.06}>
          <p className="label-mono flex max-w-[54ch] items-start gap-3 leading-[1.8] text-slate">
            <span
              aria-hidden
              className="mt-[0.45em] inline-block h-1 w-1 shrink-0 rounded-full bg-signal/70"
            />
            {trust.disclaimer}
          </p>
        </Reveal>

        <ul className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-plate)] border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
          {trust.stats.map((item, index) => (
            <li key={item.key} className="bg-void px-7 py-11 text-center">
              <Figure
                item={item}
                delay={index * 120}
                className="text-orbita-chrome font-display text-[clamp(1.9rem,3.6vw,2.9rem)] leading-none font-semibold tracking-[-0.03em] tabular-nums [font-variation-settings:'wdth'_92]"
              />
              <p className="label-mono mt-5">{item.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
