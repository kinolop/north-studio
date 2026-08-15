"use client";

import { useRef } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { agentSectionById } from "@/lib/sections";
import { useCountUp } from "@/lib/useCountUp";

const meta = agentSectionById("agent-numbers");

/**
 * Illustrative figures, counted up.
 *
 * The disclaimer is not fine print tucked under the fold — it sits directly
 * above the numbers, in the same eyeline, because a figure on a studio site
 * is read as a claim about a real client unless it is told otherwise in the
 * same glance.
 */
export function AgentNumbers() {
  const copy = useCopy();
  const numbers = copy.agentCase.numbers;

  return (
    <Section id={meta.id}>
      <div className="container-north">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
            <SplitLines
              as="h2"
              lines={numbers.title}
              className="mt-8 text-display font-display font-medium text-bone"
            />
          </div>
          <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.08}>
            <p className="label-mono flex items-start gap-3 leading-[1.8] text-slate">
              <span
                aria-hidden
                className="mt-[0.45em] inline-block h-1 w-1 shrink-0 rounded-full bg-signal/70"
              />
              {numbers.disclaimer}
            </p>
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-px overflow-hidden rounded-[var(--radius-plate)] border border-hairline bg-hairline sm:grid-cols-3">
          {numbers.items.map((item, index) => (
            <li key={item.key} className="bg-void px-7 py-12 text-center sm:py-14">
              <Figure
                value={item.value}
                literal={item.literal}
                suffix={item.suffix}
                delay={index * 140}
              />
              <p className="label-mono mt-5 text-slate">{item.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function Figure({
  value,
  literal,
  suffix,
  delay,
}: {
  value: number | null;
  literal?: string;
  suffix: string;
  delay: number;
}) {
  const hostRef = useRef<HTMLParagraphElement>(null);
  // Nothing to count for a literal like "24/7"; the hook resolves those to
  // the value immediately rather than animating toward a number that is
  // never printed.
  const shown = useCountUp(value ?? 0, hostRef, {
    delay,
    enabled: value !== null && !literal,
  });

  return (
    <p
      ref={hostRef}
      className="text-chrome font-display text-[clamp(2.6rem,6vw,4.2rem)] leading-none font-semibold tabular-nums [font-variation-settings:'wdth'_116]"
    >
      {literal ?? `${shown}${suffix}`}
    </p>
  );
}
