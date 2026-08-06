"use client";

import { useCopy } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { SECTIONS } from "@/lib/sections";

const meta = SECTIONS[7];

/** Each card sits a little lower than the last — a row reads as a table. */
const OFFSETS = ["lg:mt-0", "lg:mt-16", "lg:mt-32"] as const;

export function Voices() {
  const copy = useCopy();

  return (
    <Section id={meta.id}>
      <div className="container-north">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
            <SplitLines
              as="h2"
              lines={copy.voices.title}
              className="mt-8 text-display font-display font-medium text-bone"
            />
          </div>
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.08}>
            <p className="label-mono text-slate">{copy.voices.placeholderNote}</p>
          </Reveal>
        </div>

        <div className="mt-20 grid gap-6 lg:grid-cols-3 lg:gap-5">
          {copy.voices.items.map((voice, index) => (
            <Reveal
              key={voice.key}
              delay={index * 0.09}
              className={OFFSETS[index] ?? ""}
            >
              <figure className="glass glass-edge flex h-full flex-col p-8 transition-[border-color,transform] duration-[520ms] ease-[var(--ease-north)] hover:-translate-y-1 hover:border-signal/25 lg:p-9">
                <span
                  aria-hidden
                  className="font-display text-[3.2rem] leading-[0.6] text-signal/45"
                >
                  &ldquo;
                </span>

                <blockquote className="mt-6 text-lead text-bone">
                  {voice.quote}
                </blockquote>

                <figcaption className="mt-auto flex items-baseline gap-3 border-t border-hairline pt-8">
                  <span className="text-meta text-bone">{voice.role}</span>
                  <span aria-hidden className="h-px w-4 bg-hairline" />
                  <span className="label-mono">{voice.sector}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
