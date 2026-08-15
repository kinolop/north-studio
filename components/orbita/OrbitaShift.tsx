"use client";

import { useCopy } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { orbitaSectionById } from "@/lib/sections";

const meta = orbitaSectionById("orbita-shift");

/**
 * The problem, then the shift.
 *
 * Editorial rather than card-based: a landing that opens with three feature
 * boxes has skipped the part where the reader agrees they have the problem.
 * The before/after pairs at the end do the turn in six words each, which is
 * where the section earns the right to start selling.
 */
export function OrbitaShift() {
  const copy = useCopy();
  const shift = copy.orbitaCase.shift;

  return (
    <Section id={meta.id}>
      <div className="container-north">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
            <SplitLines
              as="h2"
              lines={shift.title}
              className="mt-8 font-display text-[clamp(1.8rem,3.4vw,3.2rem)] leading-[1] font-semibold tracking-[-0.035em] text-bone [font-variation-settings:'wdth'_92]"
            />
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            {shift.body.map((paragraph, index) => (
              <Reveal key={paragraph.slice(0, 24)} delay={index * 0.08}>
                <p
                  className={`max-w-[52ch] text-lead text-ash ${index > 0 ? "mt-8" : ""}`}
                >
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* The turn, in a table you can read in three seconds. */}
        <Reveal className="mt-24" delay={0.06}>
          <div className="overflow-hidden rounded-[var(--radius-plate)] border border-hairline">
            <div className="grid grid-cols-2 gap-px bg-hairline">
              <p className="label-mono bg-void px-6 py-4">{shift.fromLabel}</p>
              <p className="label-mono bg-void px-6 py-4 text-orbita">
                {shift.toLabel}
              </p>

              {shift.pairs.map((pair) => (
                <div key={pair.key} className="contents">
                  <p className="bg-void px-6 py-7 text-body text-slate line-through decoration-hairline decoration-1">
                    {pair.from}
                  </p>
                  <p className="bg-void px-6 py-7 text-body text-bone">
                    {pair.to}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
