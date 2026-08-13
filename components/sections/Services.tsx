"use client";

import { useChannelOverlay } from "@/components/contact/ChannelOverlayProvider";
import { useCopy } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GhostWord } from "@/components/ui/GhostWord";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import type { Service } from "@/lib/i18n/types";
import { sectionById } from "@/lib/sections";

const meta = sectionById("services");

/**
 * Three directions, no prices.
 *
 * This replaced a three-tier price table. The cards deliberately keep the
 * same glass, the same hairline rhythm and the same hover light, because
 * the section changed what it says, not what the studio looks like — and a
 * visitor who saw the old page should not feel they arrived somewhere else.
 *
 * What is gone is every affordance that came from selling packages: the
 * "from" line, the "most engagements" badge, the duration row. What
 * replaces them is a single quiet action per card, because the only next
 * step this section has ever really had is a conversation.
 */
function ServiceCard({
  service,
  index,
  discuss,
  onDiscuss,
}: {
  service: Service;
  index: number;
  discuss: string;
  onDiscuss: () => void;
}) {
  return (
    <Reveal delay={index * 0.08} className="h-full">
      <article className="glass glass-edge group relative flex h-full flex-col p-8 transition-[transform,border-color,box-shadow] duration-[520ms] ease-[var(--ease-north)] hover:-translate-y-1 hover:border-signal/30 hover:shadow-lift lg:p-10">
        <p className="label-mono text-signal-lift">
          {String(index + 1).padStart(2, "0")}
        </p>

        <h3 className="mt-6 text-title font-display font-medium text-bone">
          {service.name}
        </h3>

        <p className="mt-5 text-body text-ash">{service.summary}</p>

        <ul className="mt-8 space-y-3.5 border-t border-hairline pt-7">
          {service.includes.map((item) => (
            <li key={item} className="flex items-baseline gap-4 text-body text-ash">
              <span
                aria-hidden
                className="mt-[0.55em] h-px w-3 shrink-0 bg-slate transition-colors duration-[var(--duration-state)] group-hover:bg-signal"
              />
              {item}
            </li>
          ))}
        </ul>

        {/* One action per card, routed through the same overlay every other
            call to action on the page uses. */}
        <button
          type="button"
          onClick={onDiscuss}
          className="mt-auto flex items-center gap-3 pt-10 text-meta text-ash transition-colors duration-[var(--duration-state)] ease-[var(--ease-north)] hover:text-bone"
        >
          {discuss}
          <svg
            aria-hidden
            viewBox="0 0 24 10"
            className="h-[10px] w-6 text-signal-lift"
          >
            <path
              d="M0 5h21M17 1l4 4-4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              className="transition-transform duration-[var(--duration-state)] ease-[var(--ease-north)] group-hover:translate-x-1"
            />
          </svg>
        </button>
      </article>
    </Reveal>
  );
}

export function Services() {
  const copy = useCopy();
  const { open } = useChannelOverlay();

  return (
    <Section id={meta.id}>
      <div className="container-north">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
            <SplitLines
              as="h2"
              lines={copy.services.title}
              className="mt-8 text-display font-display font-medium text-bone"
            />
          </div>

          <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.08}>
            <p className="max-w-[42ch] text-body text-ash">{copy.services.lede}</p>
          </Reveal>
        </div>

        <div className="relative mt-20 grid gap-6 lg:grid-cols-3 lg:gap-5">
          <GhostWord className="-z-10">{copy.services.ghost}</GhostWord>

          {copy.services.items.map((service, index) => (
            <ServiceCard
              key={service.key}
              service={service}
              index={index}
              discuss={copy.services.discuss}
              onDiscuss={() => open()}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
