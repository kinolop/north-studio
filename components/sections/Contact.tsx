"use client";

import { ChannelPanel } from "@/components/contact/ChannelPanel";
import { useChannelOverlay } from "@/components/contact/ChannelOverlayProvider";
import { useCopy } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GhostWord } from "@/components/ui/GhostWord";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { sectionById } from "@/lib/sections";

const meta = sectionById("start");

/**
 * The close. Centred, because it is the one moment on the page that should
 * feel like being addressed directly rather than shown something.
 *
 * The button opens the channel chooser; the panel beneath it shows the same
 * three channels inline, for anyone who would rather not click through a
 * dialog to find a phone number.
 */
export function Contact() {
  const copy = useCopy();
  const { open } = useChannelOverlay();

  return (
    <Section id={meta.id} className="overflow-hidden">
      {/* A last rise of light from below the fold — the room brightening as
          the page ends. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-30%] h-[70%] bg-[radial-gradient(50%_50%_at_50%_100%,rgb(109_92_255/0.16),transparent_72%)]"
      />

      <GhostWord className="-z-10">NORTH</GhostWord>

      <div className="container-north relative flex flex-col items-center text-center">
        <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />

        <SplitLines
          as="h2"
          lines={copy.cta.title}
          className="mt-10 text-hero font-display font-medium text-bone [font-variation-settings:'wdth'_114]"
        />

        <Reveal delay={0.12}>
          <p className="mt-10 max-w-[46ch] text-lead text-ash">{copy.cta.lede}</p>
        </Reveal>

        {/* The close gets the largest control on the page — nothing else
            competes with it here. */}
        <Reveal delay={0.2} className="mt-14">
          <MagneticButton
            onClick={() => open()}
            pull={18}
            className="px-12 py-6 text-[1.0625rem]"
          >
            {copy.cta.action}
          </MagneticButton>
        </Reveal>

        <div className="mt-20 w-full max-w-[54rem]">
          <ChannelPanel />
        </div>
      </div>
    </Section>
  );
}
