"use client";

import { useCopy } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { SECTIONS } from "@/lib/sections";

const meta = SECTIONS[1];

/**
 * Asymmetric on purpose. The title column sticks while the argument scrolls
 * past it, so the claim stays in view for as long as the evidence takes —
 * and it breaks the centred rhythm the hero established.
 */
export function Manifesto() {
  const copy = useCopy();

  return (
    <Section id={meta.id}>
      <div className="container-north grid gap-16 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[136px]">
            <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
            <SplitLines
              as="h2"
              lines={copy.manifesto.title}
              className="mt-8 text-display font-display font-medium text-bone"
            />
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <div className="max-w-[54ch] space-y-8">
            {copy.manifesto.body.map((paragraph, index) => (
              <Reveal key={paragraph.slice(0, 24)} delay={index * 0.06}>
                <p className={index === 0 ? "text-lead text-bone" : "text-body text-ash"}>
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-16" delay={0.1}>
            <dl className="border-t border-hairline">
              {copy.manifesto.principles.map((principle) => (
                <div
                  key={principle.term}
                  className="group grid grid-cols-[9rem_1fr] items-baseline gap-6 border-b border-hairline py-6 transition-colors duration-[var(--duration-state)] ease-[var(--ease-north)] hover:border-signal/30 sm:grid-cols-[12rem_1fr]"
                >
                  <dt className="label-mono transition-colors duration-[var(--duration-state)] group-hover:text-signal-lift">
                    {principle.term}
                  </dt>
                  <dd className="text-body text-ash transition-colors duration-[var(--duration-state)] group-hover:text-bone">
                    {principle.definition}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
