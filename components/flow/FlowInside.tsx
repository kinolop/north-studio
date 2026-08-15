"use client";

import type { ReactNode } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GhostWord } from "@/components/ui/GhostWord";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { flowSectionById } from "@/lib/sections";
import { useLitPanel } from "@/lib/useLitPanel";

const meta = flowSectionById("flow-inside");

/**
 * Six diagrams, drawn rather than photographed.
 *
 * Stock imagery of "automation" is all glowing circuit boards, and the one
 * thing this page cannot afford is to look like everything else. These are
 * hairline schematics in the same language as the compass and the case
 * plates: one accent mark each, and nothing that needs a caption.
 */
const GLYPH: Record<string, ReactNode> = {
  collect: (
    <>
      <path d="M2 4c6 0 8 8 14 8M2 9c6 0 9 3 14 3M2 15c6 0 9-3 14-3M2 20c6 0 8-8 14-8" />
      <circle cx="18.5" cy="12" r="1.6" className="fill-signal stroke-none" />
    </>
  ),
  qualify: (
    <>
      <path d="M2 12h8M10 12c4 0 4-7 11-7M10 12c4 0 4 7 11 7" />
      <circle cx="21" cy="5" r="1.6" className="fill-signal stroke-none" />
      <circle cx="21" cy="19" r="1.4" />
    </>
  ),
  write: (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="1.5" />
      <path d="M6 9h7M6 12.5h5" />
      <path d="M13.5 15l2.2 2.2L20 12.8" className="stroke-signal-lift" />
    </>
  ),
  reply: (
    <>
      <path d="M3.5 5.5h17v11h-9l-5 3.5v-3.5h-3z" />
      <path
        d="M12.4 8.2l-2.6 4.2h2.2l-.6 3.4 3.4-4.6h-2.3z"
        className="fill-signal stroke-none"
      />
    </>
  ),
  report: (
    <>
      <rect x="4" y="2.5" width="16" height="19" rx="1.5" />
      <path d="M8 17v-3M12 17v-6" />
      <path d="M16 17V8" className="stroke-signal-lift" />
    </>
  ),
  always: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.5V12l3.4 2" className="stroke-signal-lift" />
      <circle cx="12" cy="12" r="1.1" className="fill-signal stroke-none" />
    </>
  ),
};

type InsideItem = ReturnType<typeof useCopy>["flowCase"]["inside"]["items"][number];

function InsideCard({ item, index }: { item: InsideItem; index: number }) {
  const lit = useLitPanel<HTMLElement>();

  return (
    <Reveal delay={(index % 3) * 0.08} className="h-full">
      <article
        ref={lit.ref}
        {...lit.props}
        className="glass glass-edge lit-panel group flex h-full flex-col p-7 hover:border-signal/30 hover:shadow-lift lg:p-8"
      >
        <div className="flex items-start justify-between gap-5">
          <p className="label-mono text-signal-lift">
            {String(index + 1).padStart(2, "0")}
          </p>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-7 w-7 shrink-0 fill-none stroke-ash stroke-[1.15] transition-colors duration-[var(--duration-state)] ease-[var(--ease-north)] group-hover:stroke-bone [stroke-linecap:round] [stroke-linejoin:round]"
          >
            {GLYPH[item.key]}
          </svg>
        </div>

        <h3 className="mt-8 font-display text-[1.25rem] leading-[1.15] font-medium tracking-[-0.02em] text-bone">
          {item.name}
        </h3>
        <p className="mt-4 text-body text-ash">{item.body}</p>
      </article>
    </Reveal>
  );
}

export function FlowInside() {
  const copy = useCopy();
  const inside = copy.flowCase.inside;

  return (
    <Section id={meta.id}>
      <div className="container-north">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
            <SplitLines
              as="h2"
              lines={inside.title}
              className="mt-8 text-display font-display font-medium text-bone"
            />
          </div>
          <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.08}>
            <p className="max-w-[42ch] text-body text-ash">{inside.lede}</p>
          </Reveal>
        </div>

        <div className="relative mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <GhostWord className="-z-10">FLOW</GhostWord>

          {inside.items.map((item, index) => (
            <InsideCard key={item.key} item={item} index={index} />
          ))}
        </div>
      </div>
    </Section>
  );
}
