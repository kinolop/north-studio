"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId, useState } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { useCopy } from "@/components/i18n/CopyProvider";
import type { QuestionCopy } from "@/lib/i18n/types";
import { SECTIONS } from "@/lib/sections";
import { DURATION, EASE } from "@/lib/motion";
import { remeasureSections } from "@/lib/scroll";
import { useReducedMotion } from "@/lib/useReducedMotion";

const meta = SECTIONS[8];

function Row({
  item,
  index,
  open,
  onToggle,
}: {
  item: QuestionCopy;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const uid = useId();
  const panelId = `${uid}-panel`;
  const buttonId = `${uid}-button`;
  const reduced = useReducedMotion();

  return (
    <div className="border-b border-hairline">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="group flex w-full items-start gap-6 py-7 text-left transition-colors duration-[var(--duration-state)] ease-[var(--ease-north)] sm:gap-10"
        >
          <span
            className={`label-mono mt-2 shrink-0 transition-colors duration-[var(--duration-state)] ${open ? "text-signal-lift" : "text-slate group-hover:text-ash"}`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          <span
            className={`flex-1 font-display text-[clamp(1.25rem,2.2vw,1.75rem)] leading-[1.15] font-medium tracking-[-0.025em] transition-colors duration-[var(--duration-state)] ${open ? "text-bone" : "text-ash group-hover:text-bone"}`}
          >
            {item.q}
          </span>

          {/* A plus that becomes a minus. One bar rotates; nothing moves. */}
          <span
            aria-hidden
            className="relative mt-3 block h-3 w-3 shrink-0"
          >
            <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-ash transition-colors duration-[var(--duration-state)] group-hover:bg-bone" />
            <span
              className={`absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-ash transition-[transform,background-color,opacity] duration-[var(--duration-state)] ease-[var(--ease-glide)] group-hover:bg-bone ${open ? "scale-y-0 opacity-0" : "scale-y-100 opacity-100"}`}
            />
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? { height: 0 } : { height: 0, opacity: 0 }}
            transition={{
              height: { duration: DURATION.state * 1.6, ease: EASE.glide },
              opacity: { duration: DURATION.state, ease: EASE.north },
            }}
            // The document just got taller; the scroll store's cached offsets
            // are now wrong.
            onAnimationComplete={remeasureSections}
            className="overflow-hidden"
          >
            <p className="max-w-[64ch] pb-9 text-body text-ash sm:pl-[4.6rem]">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Questions() {
  const copy = useCopy();
  const [openKey, setOpenKey] = useState<string | null>(
    copy.questions.items[0]?.key ?? null,
  );

  return (
    <Section id={meta.id}>
      <div className="container-north grid gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[136px]">
            <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
            <SplitLines
              as="h2"
              lines={copy.questions.title}
              className="mt-8 text-display font-display font-medium text-bone"
            />
          </div>
        </div>

        <Reveal className="lg:col-span-7 lg:col-start-6">
          <div className="border-t border-hairline">
            {copy.questions.items.map((item, index) => (
              <Row
                key={item.key}
                item={item}
                index={index}
                open={openKey === item.key}
                onToggle={() => setOpenKey(openKey === item.key ? null : item.key)}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
