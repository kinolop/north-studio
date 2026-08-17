"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { useChannelOverlay } from "@/components/contact/ChannelOverlayProvider";
import { useCopy } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HeroVideo } from "@/components/ui/HeroVideo";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { DURATION, EASE } from "@/lib/motion";
import { agentSectionById } from "@/lib/sections";

const meta = agentSectionById("agent-hero");

const ASSETS = "/work/north-agent/assets";

export function AgentHero() {
  const copy = useCopy();
  const { open } = useChannelOverlay();
  const agent = copy.agentCase;

  return (
    <Section id={meta.id} flush className="relative overflow-hidden pt-[104px] pb-section">
      {/* The hero is the film. It replaced the Ken-Burns plate outright:
          the drift, the grade across the whole frame and the still are all
          gone, because the picture now moves on its own and a background
          that pans as well only reads as unsteady. Content follows in the
          DOM and therefore paints above it. */}
      <HeroVideo src={`${ASSETS}/hero.mp4`} poster={`${ASSETS}/hero-poster.jpg`} />

      <div className="container-north relative">
        <motion.div
          className="flex flex-wrap items-center gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, ease: EASE.north, delay: 0.1 }}
        >
          <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
          <span className="label-mono rounded-full border border-signal/30 px-3 py-1 text-signal-lift">
            {agent.demoTag}
          </span>
          <Link
            href="/#work"
            className="label-mono text-slate transition-colors duration-[var(--duration-state)] hover:text-ash"
          >
            ← {agent.backToWork}
          </Link>
        </motion.div>

        {/* One column now. The mascot used to hold the right of this grid;
            it is the subject of the film behind these words, and printing
            it a second time beside itself was the one thing the video made
            impossible to keep. */}
        <div className="mt-16 grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.p
              className="text-chrome font-display text-[clamp(2.4rem,5vw,4.4rem)] leading-none font-semibold [font-variation-settings:'wdth'_118]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.reveal, ease: EASE.north, delay: 0.2 }}
            >
              {agent.productName}
            </motion.p>

            <SplitLines
              as="h1"
              lines={agent.promise}
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
              <MagneticButton onClick={() => open()}>{agent.heroCta}</MagneticButton>
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
}
