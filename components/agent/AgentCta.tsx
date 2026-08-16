"use client";

import { ChannelPanel } from "@/components/contact/ChannelPanel";
import { useChannelOverlay } from "@/components/contact/ChannelOverlayProvider";
import { useCopy } from "@/components/i18n/CopyProvider";
import { AssetSlot } from "@/components/ui/AssetSlot";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GhostWord } from "@/components/ui/GhostWord";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { agentSectionById } from "@/lib/sections";

const meta = agentSectionById("agent-start");

const ASSETS = "/work/north-agent/assets";

export function AgentCta() {
  const copy = useCopy();
  const { open } = useChannelOverlay();
  const cta = copy.agentCase.cta;

  return (
    <Section id={meta.id} className="overflow-hidden">
      {/* Background plate, graded the same way the hero's is: the type here
          is centred and white, so the image underneath it has to give way
          rather than compete. Content follows in the DOM and therefore
          paints above it. */}
      <div aria-hidden className="absolute inset-0">
        <AssetSlot
          src={`${ASSETS}/cta-bg.png`}
          label={copy.agentCase.slots.cta}
          alt=""
          fill
          kenBurns
          className="border-0"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-void),rgb(7_8_11/0.78)_42%,rgb(7_8_11/0.9))]" />
      </div>

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
