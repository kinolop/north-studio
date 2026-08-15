"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { useChannelOverlay } from "@/components/contact/ChannelOverlayProvider";
import { useCopy } from "@/components/i18n/CopyProvider";
import { AssetSlot } from "@/components/ui/AssetSlot";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { DURATION, EASE } from "@/lib/motion";
import { flowSectionById } from "@/lib/sections";

const meta = flowSectionById("flow-hero");

const ASSETS = "/work/north-flow/assets";

/**
 * The mascot is the agent case's file, referenced where it already lives.
 * One drop lights up both product pages; a copy in each folder is a copy
 * somebody eventually updates in one place only.
 */
const MASCOT = "/work/north-agent/assets/mascot.png";

export function FlowHero() {
  const copy = useCopy();
  const { open } = useChannelOverlay();
  const flow = copy.flowCase;

  return (
    <Section id={meta.id} flush className="relative overflow-hidden pt-[104px] pb-section">
      {/* Background plate. A slow Ken-Burns drift on the image; drop
          hero.mp4 beside it and the video takes over with no code change. */}
      <div aria-hidden className="absolute inset-0">
        <AssetSlot
          src={`${ASSETS}/hero.jpg`}
          videoSrc={`${ASSETS}/hero.mp4`}
          label={flow.slots.hero}
          alt=""
          fill
          kenBurns
          priority
          className="border-0"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(7_8_11/0.72),rgb(7_8_11/0.88)_55%,var(--color-void))]" />
      </div>

      <div className="container-north relative">
        <motion.div
          className="flex flex-wrap items-center gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, ease: EASE.north, delay: 0.1 }}
        >
          <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
          <span className="label-mono rounded-full border border-signal/30 px-3 py-1 text-signal-lift">
            {flow.demoTag}
          </span>
          <Link
            href="/#work"
            className="label-mono text-slate transition-colors duration-[var(--duration-state)] hover:text-ash"
          >
            ← {flow.backToWork}
          </Link>
        </motion.div>

        <div className="mt-16 grid gap-14 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <motion.p
              className="text-chrome font-display text-[clamp(2.4rem,5vw,4.4rem)] leading-none font-semibold [font-variation-settings:'wdth'_118]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.reveal, ease: EASE.north, delay: 0.2 }}
            >
              {flow.productName}
            </motion.p>

            <SplitLines
              as="h1"
              lines={flow.promise}
              className="mt-8 text-display font-display font-medium text-bone"
              delay={0.3}
              trigger="mount"
            />

            <motion.div
              className="mt-12"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.reveal, ease: EASE.north, delay: 0.6 }}
            >
              <MagneticButton onClick={() => open()}>{flow.heroCta}</MagneticButton>
            </motion.div>

            {/* The whole machine in one line, before you scroll to it. */}
            <motion.p
              className="label-mono mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 leading-[1.6]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.1, ease: EASE.north, delay: 0.75 }}
            >
              {flow.conveyor.stages.map((stage, index) => (
                <span key={stage.key} className="flex items-center gap-3">
                  {index > 0 && (
                    <span aria-hidden className="text-hairline">
                      →
                    </span>
                  )}
                  <span className={index === 0 ? "text-ash" : undefined}>
                    {stage.name}
                  </span>
                </span>
              ))}
            </motion.p>
          </div>

          <motion.div
            className="lg:col-span-4 lg:col-start-9"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: EASE.north, delay: 0.45 }}
          >
            <AssetSlot
              src={MASCOT}
              label={flow.slots.mascot}
              alt={flow.productName}
              ratio="1 / 1"
              className="mx-auto max-w-[20rem]"
            />
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
