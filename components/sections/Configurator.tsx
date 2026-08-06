"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

import { DitherLayer } from "@/components/atmosphere/DitherLayer";
import { useChannelOverlay } from "@/components/contact/ChannelOverlayProvider";
import { useCopy, useLocale } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GhostWord } from "@/components/ui/GhostWord";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { estimate, formatRoubles, type Answers } from "@/lib/estimate";
import { DURATION, EASE } from "@/lib/motion";
import { SECTIONS } from "@/lib/sections";
import { useReducedMotion } from "@/lib/useReducedMotion";

const meta = SECTIONS[4];

/**
 * Task J — the estimator.
 *
 * Four segmented controls and a readout. It is deliberately not a wizard:
 * every question is on screen at once, answers can be changed in any order,
 * and the result updates live. A four-step wizard for four questions would
 * be three more screens than the information deserves.
 *
 * The result carries the answers into the brief form, so the first thing
 * the studio receives is a summary the visitor already agreed with.
 */
export function Configurator() {
  const copy = useCopy();
  const { locale } = useLocale();
  const { open } = useChannelOverlay();
  const reduced = useReducedMotion();
  const [answers, setAnswers] = useState<Answers>({});

  const answered = Object.keys(answers).length;
  const complete = answered === copy.configurator.questions.length;
  const result = useMemo(() => estimate(answers), [answers]);

  const tier = copy.engagements.tiers.find((t) => t.key === result.tier);

  /** A one-paragraph summary in the visitor's own words, for the brief. */
  function summarise(): string {
    const lines = copy.configurator.questions.map((question) => {
      const chosen = question.choices.find(
        (choice) => answers[question.key as keyof Answers] === choice.value,
      );
      return `${question.prompt} ${chosen?.label ?? "—"}`;
    });
    return [
      ...lines,
      "",
      `${copy.configurator.matchLabel}: ${tier?.name ?? ""}`,
      `${copy.configurator.rangeLabel}: ${formatRoubles(result.low, locale)} – ${formatRoubles(result.high, locale)}`,
    ].join("\n");
  }

  return (
    <Section id={meta.id}>
      <div className="container-north">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
            <SplitLines
              as="h2"
              lines={copy.configurator.title}
              className="mt-8 text-display font-display font-medium text-bone"
            />
          </div>
          <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.08}>
            <p className="max-w-[42ch] text-body text-ash">{copy.configurator.lede}</p>
          </Reveal>
        </div>

        <Reveal className="mt-16">
          <div className="glass relative overflow-hidden">
            <DitherLayer level={0.22} scale={2} opacity={0.07} />

            <div className="relative grid lg:grid-cols-12">
              {/* Controls */}
              <div className="divide-y divide-hairline lg:col-span-7">
                {copy.configurator.questions.map((question, index) => {
                  const key = question.key as keyof Answers;
                  return (
                    <div
                      key={question.key}
                      role="group"
                      aria-labelledby={`cfg-${question.key}`}
                      className="p-7 lg:p-9"
                    >
                      <p id={`cfg-${question.key}`} className="flex items-baseline gap-4">
                        <span className="label-mono text-signal-lift">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="font-display text-[1.2rem] leading-none font-medium tracking-[-0.02em] text-bone">
                          {question.prompt}
                        </span>
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2.5">
                        {question.choices.map((choice) => {
                          const selected = answers[key] === choice.value;
                          return (
                            <button
                              key={choice.value}
                              type="button"
                              aria-pressed={selected}
                              onClick={() =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [key]: choice.value,
                                }))
                              }
                              className={[
                                "rounded-[var(--radius-control)] border px-4 py-2.5 text-meta",
                                "transition-[border-color,background-color,color] duration-[var(--duration-state)] ease-[var(--ease-north)]",
                                selected
                                  ? "border-signal/50 bg-signal/10 text-bone"
                                  : "border-hairline text-ash hover:border-slate hover:text-bone",
                              ].join(" ")}
                            >
                              {choice.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Readout */}
              <div className="relative overflow-hidden border-t border-hairline p-7 lg:col-span-5 lg:border-t-0 lg:border-l lg:p-9">
                <GhostWord>{tier?.name ?? ""}</GhostWord>

                <div className="relative flex items-center justify-between gap-4">
                  <p className="label-mono">{copy.configurator.progress}</p>
                  <p className="label-mono text-ash">
                    {answered} / {copy.configurator.questions.length}
                  </p>
                </div>

                {/* Progress as a segmented instrument bar. */}
                <div aria-hidden className="relative mt-3 flex gap-1">
                  {copy.configurator.questions.map((question, index) => (
                    <span
                      key={question.key}
                      className={`h-px flex-1 transition-colors duration-[var(--duration-state)] ${index < answered ? "bg-signal" : "bg-hairline"}`}
                    />
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {complete ? (
                    <motion.div
                      key="result"
                      initial={reduced ? false : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduced ? undefined : { opacity: 0, y: -10 }}
                      transition={{ duration: DURATION.state * 1.5, ease: EASE.north }}
                      className="relative mt-10"
                    >
                      <p className="label-mono">{copy.configurator.rangeLabel}</p>
                      <p className="text-chrome mt-3 font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-none font-semibold [font-variation-settings:'wdth'_112]">
                        {formatRoubles(result.low, locale)}
                        <span className="mx-2 text-slate">–</span>
                        {formatRoubles(result.high, locale)}
                      </p>

                      <dl className="mt-8 space-y-5 border-t border-hairline pt-8">
                        <div>
                          <dt className="label-mono">
                            {copy.configurator.timelineLabel}
                          </dt>
                          <dd className="mt-2 text-body text-bone">
                            {copy.configurator.timelines[result.timeline]}
                          </dd>
                        </div>
                        <div>
                          <dt className="label-mono">{copy.configurator.matchLabel}</dt>
                          <dd className="mt-2 text-body text-bone">{tier?.name}</dd>
                        </div>
                      </dl>

                      <p className="mt-8 text-meta text-slate">
                        {copy.configurator.disclaimer}
                      </p>

                      <div className="mt-8 flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={() =>
                            open({ mode: "brief", prefill: summarise() })
                          }
                          className="group inline-flex items-center gap-3 rounded-[var(--radius-control)] border border-hairline bg-[linear-gradient(180deg,rgb(255_255_255/0.06),rgb(255_255_255/0.015))] px-6 py-3 text-meta text-bone transition-[border-color] duration-[var(--duration-state)] ease-[var(--ease-north)] hover:border-signal/50"
                        >
                          {copy.configurator.cta}
                          <svg
                            aria-hidden
                            viewBox="0 0 24 10"
                            className="h-[10px] w-6 text-signal-lift"
                          >
                            <path
                              d="M0 5h21M17 1l4 4-4 4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.25"
                              className="transition-transform duration-[var(--duration-state)] ease-[var(--ease-north)] group-hover:translate-x-1"
                            />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAnswers({})}
                          className="label-mono text-slate transition-colors duration-[var(--duration-state)] hover:text-ash"
                        >
                          {copy.configurator.reset}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.p
                      key="pending"
                      initial={reduced ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={reduced ? undefined : { opacity: 0 }}
                      transition={{ duration: DURATION.state, ease: EASE.north }}
                      className="relative mt-10 max-w-[26ch] text-body text-slate"
                    >
                      {copy.configurator.disclaimer}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
