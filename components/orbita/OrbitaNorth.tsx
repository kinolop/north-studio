"use client";

import { useCopy } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionSeam } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { STUDIO } from "@/lib/studio";
import { orbitaSectionById } from "@/lib/sections";

const meta = orbitaSectionById("orbita-north");

/**
 * The page hands the microphone back.
 *
 * Everything above this line is ORBITA's voice; from here it is ours again,
 * and the switch is the point of the case. It is deliberately the quietest
 * section on the page — the studio's violet returns, the display type goes
 * back to North's wide axis, and there is exactly one claim, unquantified.
 * A case that ends by shouting about the agency undoes the work above it.
 */
export function OrbitaNorth() {
  const copy = useCopy();
  const north = copy.orbitaCase.north;

  return (
    <>
      <SectionSeam />
      <Section id={meta.id}>
        <div className="container-north grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
            <SplitLines
              as="h2"
              lines={north.title}
              className="mt-8 text-display font-display font-medium text-bone"
            />

            <Reveal delay={0.12}>
              <p className="label-mono mt-10 flex items-center gap-3">
                <span aria-hidden className="h-px w-8 bg-hairline" />
                {STUDIO.wordmarkFull}
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            {north.body.map((paragraph, index) => (
              <Reveal key={paragraph.slice(0, 24)} delay={index * 0.08}>
                <p
                  className={`max-w-[52ch] text-body text-ash ${index > 0 ? "mt-7" : ""}`}
                >
                  {paragraph}
                </p>
              </Reveal>
            ))}

            <Reveal delay={0.2}>
              <p className="label-mono mt-12">{north.didLabel}</p>
              <ul className="mt-6 flex flex-wrap gap-2.5">
                {north.did.map((item) => (
                  <li
                    key={item}
                    className="label-mono rounded-full border border-hairline px-4 py-2 text-ash transition-colors duration-[var(--duration-state)] ease-[var(--ease-north)] hover:border-signal/40 hover:text-bone"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </Section>
    </>
  );
}
