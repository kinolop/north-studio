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
import { TELEGRAM_CHANNEL } from "@/lib/channels";
import { sectionById } from "@/lib/sections";

const meta = sectionById("start");

/**
 * The close. Centred, because it is the one moment on the page that should
 * feel like being addressed directly rather than shown something.
 *
 * The first button opens the channel chooser; the second goes straight to
 * the studio's Telegram channel. The panel beneath them shows the same
 * three direct channels inline, for anyone who would rather not click
 * through a dialog to find a phone number.
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
            competes with it here.

            The channel sits beside it rather than under it: both are one
            tap to a Telegram screen, and stacking them would have implied a
            first and second choice where there is really just "talk to us"
            and "watch us work". They share the primary treatment for the
            same reason — the accent, the bloom and the magnetic pull are
            what make a control read as ours, and a quieter variant here
            would have looked like the link we bolted on afterwards. Wrap
            rather than shrink below `sm`: two full-size controls side by
            side on a phone would each be too narrow to read. */}
        <Reveal delay={0.2} className="mt-14">
          <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row sm:gap-5">
            <MagneticButton
              onClick={() => open()}
              pull={18}
              className="w-full justify-center px-12 py-6 text-[1.0625rem] sm:w-auto"
            >
              {copy.cta.action}
            </MagneticButton>

            <MagneticButton
              href={TELEGRAM_CHANNEL.href}
              external
              pull={18}
              className="w-full justify-center px-12 py-6 text-[1.0625rem] sm:w-auto"
            >
              {copy.cta.channel}
            </MagneticButton>
          </div>
        </Reveal>

        <div className="mt-20 w-full max-w-[54rem]">
          <ChannelPanel />
        </div>
      </div>
    </Section>
  );
}
