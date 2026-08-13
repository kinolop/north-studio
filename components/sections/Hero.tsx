"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

import { useChannelOverlay } from "@/components/contact/ChannelOverlayProvider";
import { useCopy } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { DURATION, EASE } from "@/lib/motion";
import { sectionById } from "@/lib/sections";

/**
 * The whole 3D layer is deferred: three, R3F and drei are ~400kB and none
 * of it is needed to render the headline, which is what the page is
 * actually for. The placeholder below holds the composition until it lands.
 */
const HeroScene = dynamic(
  () => import("@/components/scene/HeroScene").then((m) => m.HeroScene),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(38%_46%_at_58%_46%,rgb(148_156_178/0.16),transparent_70%)]"
      />
    ),
  },
);

const meta = sectionById("origin");

export function Hero() {
  const copy = useCopy();
  const { open } = useChannelOverlay();

  return (
    // svh, not dvh: dvh changes as mobile browser chrome hides and shows,
    // which would relayout the hero mid-scroll.
    <Section id={meta.id} flush className="min-h-[100svh] overflow-hidden">
      {/* The object sits behind the type. Overlapping them is what gives the
          first screen depth — a headline beside a render is a slide, a
          headline crossing in front of one is a photograph. */}
      <div className="absolute inset-0 lg:left-[26%]">
        <HeroScene />
      </div>

      {/* Portrait puts the type straight over the chrome, so the copy gets a
          scrim it does not need on wide screens. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[38%] bottom-0 bg-[linear-gradient(to_top,var(--color-void)_18%,rgb(7_8_11/0.86)_46%,transparent)] lg:hidden"
      />

      <div className="container-north relative flex min-h-[100svh] flex-col justify-between pt-[104px] pb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: EASE.north, delay: 0.15 }}
        >
          <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
        </motion.div>

        <div>
          <SplitLines
            as="h1"
            lines={copy.hero.headline}
            className="text-hero font-display font-medium text-bone [font-variation-settings:'wdth'_114]"
            delay={0.25}
            stagger={0.09}
            trigger="mount"
          />

          <motion.p
            className="mt-9 max-w-[46ch] text-lead text-ash"
            initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: DURATION.reveal, ease: EASE.north, delay: 0.62 }}
          >
            {copy.hero.lede}
          </motion.p>

          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.reveal, ease: EASE.north, delay: 0.78 }}
          >
            <MagneticButton onClick={() => open()}>
              {copy.studio.startProject}
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div
          className="flex items-end justify-end gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: EASE.north, delay: 1 }}
        >
          {/* The wordmark that used to sit here repeated the header and
              collided with the compass instrument. Chanel's rule applies. */}
          <div className="flex items-center gap-3">
            <span className="label-mono">{copy.hero.scrollHint}</span>
            <span
              aria-hidden
              className="relative block h-9 w-px overflow-hidden bg-hairline"
            >
              <span className="absolute inset-x-0 top-0 h-3 animate-[railFall_2.6s_var(--ease-glide)_infinite] bg-signal motion-reduce:animate-none" />
            </span>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
