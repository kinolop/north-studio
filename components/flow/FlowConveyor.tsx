"use client";

import { useEffect, useReducer, useRef, type CSSProperties } from "react";

import { SectionBackdrop } from "@/components/atmosphere/SectionBackdrop";
import { useCopy, useLocale } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Figure } from "@/components/ui/Figure";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import {
  CADENCE_MS,
  CARD_BASE,
  CYCLE_MS,
  MINUTES_PER_LEAD,
  SEED_MINUTES_AGO,
  STATION_DELAY_MS,
  clockAt,
  initialLine,
  lineReducer,
  type JournalEntry,
} from "@/lib/conveyor";
import { formatNumber } from "@/lib/format";
import { flowSectionById } from "@/lib/sections";
import { useOnScreen } from "@/lib/useOnScreen";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { FlowChip } from "./FlowChip";
import { FlowJournal } from "./FlowJournal";

const meta = flowSectionById("flow-conveyor");
const ASSETS = "/work/north-flow/assets";

/**
 * Where each of the four cells begins. A cell is a quarter of the lane in
 * whichever direction the lane runs, which is the whole trick: a chip
 * wrapper is exactly one cell, so translating it by multiples of its own
 * width lands it dead centre on a station at any size, unmeasured.
 */
const CELL = [
  "top-0 lg:left-0",
  "top-1/4 lg:top-0 lg:left-1/4",
  "top-2/4 lg:top-0 lg:left-2/4",
  "top-3/4 lg:top-0 lg:left-3/4",
] as const;

/** Common geometry for anything that parks in a cell. */
const IN_CELL =
  "absolute left-0 flex h-1/4 w-full lg:h-full lg:w-1/4 lg:items-end lg:justify-center lg:pl-0";

/**
 * The centrepiece: leads on a line, handling themselves.
 *
 * There is no simulation loop here. Five chips run one looping CSS animation
 * at even phase offsets, and the browser's animation clock is the only clock
 * on the page — React hears `animationiteration` roughly every two seconds
 * and does nothing else. That is what keeps it at 60fps underneath fog,
 * chrome and a scroll rail, and why the stations can pulse in time with
 * arrivals without ever being told a chip is there.
 */
export function FlowConveyor() {
  const copy = useCopy();
  const { locale } = useLocale();
  const reduced = useReducedMotion();

  const flow = copy.flowCase;
  const conveyor = flow.conveyor;
  const leads = conveyor.leads;

  const plateRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(plateRef);
  const [line, dispatch] = useReducer(lineReducer, undefined, initialLine);

  // The log the line wrote before the visitor arrived. Seeded after mount
  // rather than on the server, because it is stamped with the visitor's own
  // clock and the server does not have it.
  useEffect(() => {
    const entries: JournalEntry[] = SEED_MINUTES_AGO.map((minutes, index) => ({
      id: index,
      lead: leads.length - SEED_MINUTES_AGO.length + index,
      card: CARD_BASE - SEED_MINUTES_AGO.length + index,
      time: clockAt(minutes * 60_000),
    }));

    dispatch({ type: "seed", entries, leads });
  }, [leads]);

  /**
   * A chip has finished its circuit. Every animation on a chip shares the
   * one duration, so several iteration events arrive together and bubble —
   * the name is what separates the journey from the details written on it.
   */
  const onIteration =
    (slot: number) => (event: React.AnimationEvent<HTMLDivElement>) => {
      if (event.animationName !== "flowRunX" && event.animationName !== "flowRunY") {
        return;
      }
      dispatch({ type: "cycle", slot, time: clockAt(), leads });
    };

  const hoursSaved = (line.processed * MINUTES_PER_LEAD) / 60;

  const tallyValue = (key: "processed" | "warm" | "cold" | "hours") => {
    if (key === "hours") {
      return `${formatNumber(hoursSaved, locale, 1)}${conveyor.tally.hoursSuffix}`;
    }
    return formatNumber(line[key], locale);
  };

  return (
    <Section id={meta.id} className="overflow-hidden">
      {/* The machine's own light. Coded by default; `bg-conveyor.png` takes
          over if the founder ever drops one in. */}
      <SectionBackdrop
        tone="machine"
        src={`${ASSETS}/bg-conveyor.png`}
        label={flow.slots.bgConveyor}
      />

      <div className="container-north">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
            <SplitLines
              as="h2"
              lines={conveyor.title}
              className="mt-8 text-display font-display font-medium text-bone"
            />
          </div>

          <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.08}>
            <p className="max-w-[48ch] text-body text-ash">{conveyor.lede}</p>
            {/* An honesty note, not a caption — set as small body text so it
                is actually read rather than skimmed past as a label. */}
            <p className="mt-7 flex max-w-[48ch] gap-3 text-meta leading-[1.7] text-slate">
              <span
                aria-hidden
                className="mt-[0.5em] inline-block h-1 w-1 shrink-0 rounded-full bg-signal/70"
              />
              {flow.brandNote}
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid items-stretch gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-8">
            <div
              ref={plateRef}
              data-conveyor={onScreen ? "running" : "held"}
              style={
                {
                  "--cycle": `${CYCLE_MS}ms`,
                  "--cadence": `${CADENCE_MS}ms`,
                } as CSSProperties
              }
              className="glass glass-edge relative flex h-full flex-col overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-b border-hairline px-5 py-4 lg:px-6">
                <p className="label-mono text-ash">{conveyor.lineLabel}</p>
                <p className="label-mono flex items-center gap-2.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60 motion-reduce:hidden" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
                  </span>
                  {conveyor.runningLabel}
                  <span aria-hidden className="h-px w-5 bg-hairline" />
                  {conveyor.clientLabel}
                </p>
              </div>

              {/* Four stations. Stacked rows on a phone, a row of columns on
                  a desk — the same machine, turned ninety degrees. */}
              <div className="relative h-[32rem] lg:h-[18rem]">
                <div className="grid h-full grid-rows-4 lg:grid-cols-4 lg:grid-rows-1">
                  {conveyor.stages.map((stage, index) => (
                    <div
                      key={stage.key}
                      className={`relative flex items-center px-5 lg:items-start lg:px-6 ${
                        index > 0
                          ? "border-t border-hairline lg:border-t-0 lg:border-l"
                          : ""
                      }`}
                    >
                      <div className="w-[7rem] lg:w-auto lg:pt-5">
                        <p className="label-mono text-signal-lift">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <h3 className="mt-2.5 font-display text-[0.8rem] leading-[1.2] font-medium tracking-[-0.02em] text-bone lg:text-[1.05rem] lg:leading-[1.15]">
                          {stage.name}
                        </h3>
                        <p className="label-mono mt-2 hidden leading-[1.6] lg:block">
                          {stage.note}
                        </p>
                        {/* The stack at the end of the line, counting up.
                            Noun first, number second: Russian agrees a noun
                            with the number in front of it, and "4 карточек"
                            is wrong in a way no English reader would catch.
                            As a readout the noun stands alone and every
                            value is correct in both languages. */}
                        {stage.key === "crm" && (
                          <p className="label-mono mt-2">
                            {conveyor.cardsLabel}
                            <span aria-hidden className="px-1.5 text-hairline">
                              ·
                            </span>
                            <span className="text-signal-lift tabular-nums">
                              {formatNumber(line.processed, locale)}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pointer-events-none absolute inset-y-0 right-0 left-[7rem] lg:inset-x-0 lg:top-[7.25rem] lg:bottom-0">
                  {/* The rail the chips ride, in each orientation. */}
                  <span
                    aria-hidden
                    className="absolute inset-y-4 left-3 w-px bg-[linear-gradient(180deg,transparent,var(--color-hairline)_12%,var(--color-hairline)_88%,transparent)] lg:hidden"
                  />
                  <span
                    aria-hidden
                    className="absolute right-6 bottom-[1.6rem] left-0 hidden h-px bg-[linear-gradient(90deg,transparent,var(--color-hairline)_6%,var(--color-hairline)_94%,transparent)] lg:block"
                  />

                  {conveyor.stages.map((stage, index) => (
                    <span
                      key={stage.key}
                      className={`${IN_CELL} items-center justify-start pl-2 lg:pb-[1.35rem] ${CELL[index] ?? ""}`}
                    >
                      <span
                        data-flow
                        style={{
                          animationDelay: `${STATION_DELAY_MS[index] ?? 0}ms`,
                        }}
                        className="h-2 w-2 animate-[flowStation_var(--cadence)_var(--ease-north)_infinite] rotate-45 border border-signal-lift/60 bg-void opacity-40"
                      />
                    </span>
                  ))}

                  {reduced
                    ? /* Motion is unwanted: park a chip at every station,
                         each showing exactly what it would have earned by
                         that point. The animation's own frames, read as a
                         diagram instead of watched as a machine. */
                      conveyor.stages.map((stage, index) => {
                        const lead = leads[index];
                        if (!lead) return null;

                        return (
                          <span
                            key={stage.key}
                            className={`${IN_CELL} items-center justify-start pl-7 lg:pb-[2.9rem] ${CELL[index] ?? ""}`}
                          >
                            <FlowChip
                              lead={lead}
                              card={CARD_BASE + index}
                              filedLabel={conveyor.filedLabel}
                              station={index}
                            />
                          </span>
                        );
                      })
                    : line.slots.map((slot, index) => {
                        const lead = leads[slot.lead];
                        if (!lead) return null;

                        // Negative, so the line is already full the moment
                        // it starts: this has been running all night, not
                        // waiting for you to arrive.
                        const delay = -index * CADENCE_MS;

                        return (
                          <div
                            key={index}
                            data-flow
                            onAnimationIteration={onIteration(index)}
                            style={{ animationDelay: `${delay}ms` }}
                            className={`${IN_CELL} top-0 animate-[flowRunY_var(--cycle)_var(--ease-glide)_infinite_both] items-center justify-start pl-7 will-change-transform lg:animate-[flowRunX_var(--cycle)_var(--ease-glide)_infinite_both] lg:pb-[2.9rem]`}
                          >
                            <FlowChip
                              lead={lead}
                              card={slot.card}
                              filedLabel={conveyor.filedLabel}
                              delay={delay}
                            />
                          </div>
                        );
                      })}
                </div>
              </div>

              {reduced && (
                <p className="label-mono border-t border-hairline px-5 py-4 leading-[1.7] lg:px-6">
                  {conveyor.stillLabel}
                </p>
              )}
            </div>
          </Reveal>

          <Reveal className="lg:col-span-4" delay={0.1}>
            <FlowJournal
              entries={line.journal}
              leads={leads}
              title={conveyor.journal.title}
              liveLabel={conveyor.journal.liveLabel}
              note={conveyor.journal.note}
            />
          </Reveal>
        </div>

        {/* The machine's own counter. Everything in it was earned in front
            of the visitor, which is the only kind of number this page can
            honestly print large. */}
        <Reveal delay={0.06}>
          <div className="mt-5 overflow-hidden rounded-[var(--radius-plate)] border border-hairline">
            <p className="label-mono flex items-center gap-3 border-b border-hairline px-5 py-3.5 lg:px-6">
              <span
                aria-hidden
                className="inline-block h-1 w-1 rounded-full bg-signal/70"
              />
              {conveyor.tally.label}
            </p>
            <dl className="grid grid-cols-2 gap-px bg-hairline sm:grid-cols-4">
              {conveyor.tally.items.map((item) => (
                <div key={item.key} className="bg-void px-5 py-6 lg:px-6">
                  <dd className="font-display text-[1.55rem] leading-none font-semibold tabular-nums text-bone [font-variation-settings:'wdth'_116]">
                    {tallyValue(item.key)}
                  </dd>
                  <dt className="label-mono mt-3">{item.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        <Reveal className="mt-20" delay={0.08}>
          <p className="label-mono flex max-w-[52ch] items-start gap-3 leading-[1.8] text-slate">
            <span
              aria-hidden
              className="mt-[0.45em] inline-block h-1 w-1 shrink-0 rounded-full bg-signal/70"
            />
            {conveyor.stats.disclaimer}
          </p>
        </Reveal>

        <ul className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-plate)] border border-hairline bg-hairline sm:grid-cols-3">
          {conveyor.stats.items.map((item, index) => (
            <li key={item.key} className="bg-void px-7 py-12 text-center sm:py-14">
              <Figure
                item={item}
                delay={index * 140}
                className="text-chrome font-display text-[clamp(2.6rem,6vw,4.2rem)] leading-none font-semibold tabular-nums [font-variation-settings:'wdth'_116]"
              />
              <p className="label-mono mt-5 text-slate">{item.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

