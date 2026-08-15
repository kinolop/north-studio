"use client";

import { CodedBackdrop } from "@/components/atmosphere/SectionBackdrop";
import { useCopy } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { agentSectionById } from "@/lib/sections";

const meta = agentSectionById("agent-deploy");

/**
 * Four short facts about getting it running. Deliberately a row of hairline
 * cells rather than cards — this is reassurance, not a second pitch, and it
 * should read quickly and then get out of the way.
 */
export function AgentDeploy() {
  const copy = useCopy();
  const deploy = copy.agentCase.deploy;

  return (
    <Section id={meta.id} className="overflow-hidden">
      <CodedBackdrop tone="faint" className="-z-10" />

      <div className="container-north grid gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
          <SplitLines
            as="h2"
            lines={deploy.title}
            className="mt-8 text-display font-display font-medium text-bone"
          />
        </div>

        <Reveal className="lg:col-span-7 lg:col-start-6">
          <dl className="border-t border-hairline">
            {deploy.items.map((item, index) => (
              <div
                key={item.key}
                className="group grid grid-cols-[3rem_1fr] items-baseline gap-x-6 gap-y-2 border-b border-hairline py-7 transition-colors duration-[var(--duration-state)] ease-[var(--ease-north)] hover:border-signal/30 sm:grid-cols-[3rem_14rem_1fr]"
              >
                <p className="label-mono text-signal-lift">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <dt className="font-display text-[1.15rem] leading-none font-medium tracking-[-0.02em] text-bone">
                  {item.name}
                </dt>
                <dd className="col-start-2 text-body text-ash sm:col-start-3">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </Section>
  );
}
