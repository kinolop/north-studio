"use client";

import { CodedBackdrop } from "@/components/atmosphere/SectionBackdrop";
import { ChannelPanel } from "@/components/contact/ChannelPanel";
import { useChannelOverlay } from "@/components/contact/ChannelOverlayProvider";
import { useCopy } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GhostWord } from "@/components/ui/GhostWord";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { agentSectionById } from "@/lib/sections";

const meta = agentSectionById("agent-start");

export function AgentCta() {
  const copy = useCopy();
  const { open } = useChannelOverlay();
  const cta = copy.agentCase.cta;

  return (
    <Section id={meta.id} className="overflow-hidden">
      <CodedBackdrop tone="close" className="-z-10" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-30%] h-[70%] bg-[radial-gradient(50%_50%_at_50%_100%,rgb(109_92_255/0.16),transparent_72%)]"
      />

      <GhostWord className="-z-10">AGENT</GhostWord>

      <div className="container-north relative flex flex-col items-center text-center">
        <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />

        <SplitLines
          as="h2"
          lines={cta.title}
          className="mt-10 text-display font-display font-medium text-bone"
        />

        <Reveal delay={0.12}>
          <p className="mt-9 max-w-[46ch] text-lead text-ash">{cta.lede}</p>
        </Reveal>

        <Reveal delay={0.2} className="mt-14">
          <MagneticButton
            onClick={() => open()}
            pull={18}
            className="px-12 py-6 text-[1.0625rem]"
          >
            {cta.action}
          </MagneticButton>
        </Reveal>

        {/* The same three channels as the home page, from the same source. */}
        <div className="mt-20 w-full max-w-[54rem]">
          <ChannelPanel />
        </div>
      </div>
    </Section>
  );
}
