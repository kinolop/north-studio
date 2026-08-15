"use client";

import { useCopy } from "@/components/i18n/CopyProvider";
import { AssetSlot } from "@/components/ui/AssetSlot";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GhostWord } from "@/components/ui/GhostWord";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { agentSectionById } from "@/lib/sections";

const meta = agentSectionById("agent-capabilities");
const ASSETS = "/work/north-agent/assets";

/** Image file per capability, in the order the dictionary lists them. */
const IMAGE: Record<string, string> = {
  answers: "cap-answers.png",
  knows: "cap-knows.png",
  enroll: "cap-enroll.png",
};

export function AgentCapabilities() {
  const copy = useCopy();
  const caps = copy.agentCase.capabilities;

  return (
    <Section id={meta.id}>
      <div className="container-north">
        <div className="max-w-[46rem]">
          <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
          <SplitLines
            as="h2"
            lines={caps.title}
            className="mt-8 text-display font-display font-medium text-bone"
          />
        </div>

        <div className="relative mt-20 grid gap-6 lg:grid-cols-3 lg:gap-5">
          <GhostWord className="-z-10">AGENT</GhostWord>

          {caps.items.map((item, index) => (
            <Reveal key={item.key} delay={index * 0.08} className="h-full">
              <article className="glass glass-edge group flex h-full flex-col overflow-hidden transition-[transform,border-color,box-shadow] duration-[520ms] ease-[var(--ease-north)] hover:-translate-y-1 hover:border-signal/30 hover:shadow-lift">
                <AssetSlot
                  src={`${ASSETS}/${IMAGE[item.key]}`}
                  label={item.slotLabel}
                  alt={item.name}
                  ratio="4 / 5"
                  className="rounded-none border-x-0 border-t-0"
                />

                <div className="flex flex-1 flex-col p-7 lg:p-8">
                  <p className="label-mono text-signal-lift">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-5 font-display text-[1.35rem] leading-[1.1] font-medium tracking-[-0.02em] text-bone">
                    {item.name}
                  </h3>
                  <p className="mt-4 text-body text-ash">{item.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
