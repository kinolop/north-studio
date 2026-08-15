"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { CodedBackdrop } from "@/components/atmosphere/SectionBackdrop";
import { useCopy } from "@/components/i18n/CopyProvider";
import { AssetSlot } from "@/components/ui/AssetSlot";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { DURATION, EASE } from "@/lib/motion";
import { orbitaSectionById } from "@/lib/sections";

import { OrbitaMark } from "./OrbitaMark";
import { OrbitaOrbit } from "./OrbitaOrbit";

const meta = orbitaSectionById("orbita-hero");
const ASSETS = "/work/orbita/assets";

/**
 * ORBITA's own hero — and the first thing on the page that has to prove the
 * case, because a visitor decides whether a studio can design a brand in
 * about two seconds.
 *
 * So nothing here is the studio's: not the wordmark (Archivo narrowed to
 * wdth 78 and letterspaced, against North's expanded 118), not the accent,
 * not the object. The only North on the screen is the fixed chrome and the
 * thin case frame above, which is exactly the relationship a case should
 * show — our work, holding a brand that is not ours.
 */
export function OrbitaHero() {
  const copy = useCopy();
  const orbita = copy.orbitaCase;
  const hero = orbita.hero;
  const frame = orbita.frame;

  return (
    <Section id={meta.id} flush className="relative overflow-hidden pt-[104px] pb-section">
      <div aria-hidden className="absolute inset-0">
        <AssetSlot
          src={`${ASSETS}/hero.png`}
          videoSrc={`${ASSETS}/hero.mp4`}
          label={orbita.slots.hero}
          alt=""
          fill
          kenBurns
          priority
          className="border-0"
          fallback={<CodedBackdrop tone="hero" hue="orbita" />}
        />
        {/* Graded colder than the other two cases: the plate underneath is
            ORBITA's, so the light on it should be ORBITA's too. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(7_8_11/0.74),rgb(8_18_22/0.86)_52%,var(--color-void))]" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_72%_28%,rgb(78_201_220/0.12),transparent_70%)]" />
      </div>

      <div className="container-north relative">
        {/* The case frame. Studio voice, said once, quietly, and then out of
            the way for the rest of the page. */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, ease: EASE.north, delay: 0.1 }}
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
            <span className="label-mono rounded-full border border-signal/30 px-3 py-1 text-signal-lift">
              {orbita.demoTag}
            </span>
            <Link
              href="/#work"
              className="label-mono text-slate transition-colors duration-[var(--duration-state)] hover:text-ash"
            >
              ← {orbita.backToWork}
            </Link>
          </div>

          <dl className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-plate)] border border-hairline bg-hairline sm:grid-cols-3">
            {(
              [
                [frame.clientLabel, frame.client],
                [frame.roleLabel, frame.role],
                [frame.yearLabel, frame.year],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="bg-void px-6 py-5">
                <dt className="label-mono">{label}</dt>
                <dd className="mt-2.5 text-meta text-bone">{value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <div className="mt-20 grid gap-16 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-6">
            <motion.p
              className="flex items-center gap-4 font-display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-none font-semibold text-bone [font-variation-settings:'wdth'_78] [letter-spacing:0.3em]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.reveal, ease: EASE.north, delay: 0.2 }}
            >
              <OrbitaMark className="h-[1.05em] w-[1.05em] shrink-0" />
              {hero.wordmark}
            </motion.p>

            {/* ORBITA's display voice: narrow where North's is wide. Same
                face, opposite end of its width axis — a different brand for
                no extra bytes. */}
            <SplitLines
              as="h1"
              lines={hero.promise}
              className="mt-10 font-display text-[clamp(2rem,3.9vw,3.7rem)] leading-[0.98] font-semibold tracking-[-0.035em] text-bone [font-variation-settings:'wdth'_92]"
              delay={0.3}
              trigger="mount"
            />

            <motion.p
              className="mt-9 max-w-[46ch] text-lead text-ash"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.reveal, ease: EASE.north, delay: 0.5 }}
            >
              {hero.lede}
            </motion.p>

            <motion.div
              className="mt-12"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.reveal, ease: EASE.north, delay: 0.62 }}
            >
              {/* ORBITA's own call to action, and honest about being a
                  demo: it moves you down the page rather than pretending to
                  open an account that does not exist. */}
              <a
                href="#orbita-product"
                className="group inline-flex items-center gap-4 rounded-[var(--radius-control)] border border-orbita/40 bg-orbita/8 px-8 py-4 text-meta text-bone transition-[border-color,background-color] duration-[var(--duration-state)] ease-[var(--ease-north)] hover:border-orbita/70 hover:bg-orbita/15"
              >
                {hero.cta}
                <svg aria-hidden viewBox="0 0 24 10" className="h-[10px] w-6 text-orbita">
                  <path
                    d="M0 5h21M17 1l4 4-4 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    className="transition-transform duration-[var(--duration-state)] ease-[var(--ease-north)] group-hover:translate-x-1"
                  />
                </svg>
              </a>
            </motion.div>
          </div>

          <motion.div
            className="lg:col-span-5 lg:col-start-8"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.3, ease: EASE.north, delay: 0.4 }}
          >
            <OrbitaOrbit />
          </motion.div>
        </div>

        <motion.p
          className="mt-24 flex max-w-[62ch] gap-3 text-meta leading-[1.7] text-slate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, ease: EASE.north, delay: 0.8 }}
        >
          <span
            aria-hidden
            className="mt-[0.5em] inline-block h-1 w-1 shrink-0 rounded-full bg-signal/70"
          />
          {frame.note}
        </motion.p>
      </div>
    </Section>
  );
}
