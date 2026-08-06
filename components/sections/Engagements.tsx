"use client";

import { useCopy } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GhostWord } from "@/components/ui/GhostWord";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import type { Tier } from "@/lib/i18n/types";
import { SECTIONS } from "@/lib/sections";

const meta = SECTIONS[3];

/** Exactly one tier carries the section's accent moment. */
const EMPHASISED = "studio";

function EngagementCard({
  tier,
  index,
  emphasised,
  mostPopular,
  runsLabel,
}: {
  tier: Tier;
  index: number;
  emphasised: boolean;
  mostPopular: string;
  runsLabel: string;
}) {
  return (
    <Reveal delay={index * 0.08} className="h-full">
      <article
        className={[
          "glass glass-edge group relative flex h-full flex-col p-8 lg:p-10",
          "transition-[transform,border-color,box-shadow] duration-[520ms] ease-[var(--ease-north)]",
          "hover:-translate-y-1 hover:border-signal/30 hover:shadow-lift",
          emphasised ? "border-signal/25" : "",
        ].join(" ")}
      >
        {emphasised && (
          <p className="label-mono absolute -top-px left-8 -translate-y-1/2 rounded-full border border-signal/30 bg-riser px-3 py-1 text-signal-lift lg:left-10">
            {mostPopular}
          </p>
        )}

        <header>
          <h3 className="text-title font-display font-medium text-bone">{tier.name}</h3>
          <p className="price-mono mt-4 text-ash">{tier.from}</p>
        </header>

        <p className="mt-8 text-lead text-bone">{tier.tagline}</p>
        <p className="mt-4 text-body text-ash">{tier.forWhom}</p>

        <ul className="mt-9 space-y-3.5 border-t border-hairline pt-8">
          {tier.includes.map((item) => (
            <li key={item} className="flex items-baseline gap-4 text-body text-ash">
              <span
                aria-hidden
                className="mt-[0.55em] h-px w-3 shrink-0 bg-slate transition-colors duration-[var(--duration-state)] group-hover:bg-signal"
              />
              {item}
            </li>
          ))}
        </ul>

        <footer className="mt-auto pt-10">
          <dl className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <dt className="label-mono">{runsLabel}</dt>
            <dd className="text-meta text-bone">{tier.duration}</dd>
          </dl>
          <p className="mt-5 border-t border-hairline pt-5 text-body text-bone">
            {tier.outcome}
          </p>
        </footer>
      </article>
    </Reveal>
  );
}

export function Engagements() {
  const copy = useCopy();

  return (
    <Section id={meta.id}>
      <div className="container-north">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
            <SplitLines
              as="h2"
              lines={copy.engagements.title}
              className="mt-8 text-display font-display font-medium text-bone"
            />
          </div>

          <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.08}>
            <p className="max-w-[42ch] text-body text-ash">{copy.engagements.lede}</p>
            <p className="price-mono mt-7 text-signal-lift">
              {copy.engagements.anchorLine}
            </p>
          </Reveal>
        </div>

        <div className="relative mt-20 grid gap-6 lg:grid-cols-3 lg:gap-5">
          <GhostWord className="-z-10">STUDIO</GhostWord>
          {copy.engagements.tiers.map((tier, index) => (
            <EngagementCard
              key={tier.key}
              tier={tier}
              index={index}
              emphasised={tier.key === EMPHASISED}
              mostPopular={copy.engagements.mostPopular}
              runsLabel={copy.engagements.runsLabel}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
