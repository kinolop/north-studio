"use client";

import { useEffect, useRef, useState } from "react";

import { InkButton } from "@/components/home/InkButton";
import { useCopy } from "@/components/i18n/CopyProvider";
import { PrintLines } from "@/components/motion/PrintLines";
import { TypeText } from "@/components/motion/TypeText";
import { Section } from "@/components/ui/Section";
import { STATION_COUNT, type LineLead } from "@/lib/flowLine";
import type { FlowChannel } from "@/lib/i18n/types";
import { useOnScreen } from "@/lib/useOnScreen";

import { formatMinute, useFlowLine, type JournalEntry } from "./FlowLineStore";

const CHANNELS: readonly FlowChannel[] = ["telegram", "whatsapp", "site", "avito", "call", "email"];
const STATION_AT = [12.5, 37.5, 62.5, 87.5];

/** How long the visitor has to be idle before the line feeds itself. */
const IDLE_MS = 6500;
const AUTO_EVERY_MS = 3600;

/**
 * The line, handed to the visitor.
 *
 * Choose where an enquiry came from, write what a client would say (or take
 * one of the ready-made ones), and send it. It joins the queue, rides the
 * rail through the four stations, is stamped, given a manager and a CRM
 * record, and lands in that manager's column, while the journal writes down
 * each step. Left alone, the line keeps itself busy with sample enquiries so
 * it never sits still on a visitor who is only watching.
 */
export function FlowLab() {
  const copy = useCopy();
  const flow = copy.flowCase;
  const lab = flow.lab;
  const { leads, journal, send } = useFlowLine();

  const sectionRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(sectionRef, "0px");
  const [channel, setChannel] = useState<FlowChannel>("telegram");
  const [draft, setDraft] = useState("");
  const lastTouch = useRef(0);
  const sample = useRef(0);

  const active = leads.find((lead) => lead.stage < STATION_COUNT);
  const waiting = leads.filter((lead) => lead.stage < STATION_COUNT).length - (active ? 1 : 0);
  const filed = leads.filter((lead) => lead.stage >= STATION_COUNT);
  const autoRunning = onScreen && Date.now() - lastTouch.current > IDLE_MS;

  const submit = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    lastTouch.current = Date.now();
    send(channel, clean, true);
    setDraft("");
  };

  // When nobody is driving, the line feeds itself from the sample stream.
  useEffect(() => {
    if (!onScreen) return;
    const id = window.setInterval(() => {
      if (Date.now() - lastTouch.current < IDLE_MS) return;
      const busy = leads.some((lead) => lead.stage < STATION_COUNT);
      if (busy) return;
      const next = lab.samples[sample.current % lab.samples.length]!;
      sample.current += 1;
      send(next.channel, next.text, false);
    }, AUTO_EVERY_MS);
    return () => window.clearInterval(id);
  }, [onScreen, leads, lab.samples, send]);

  const routeName = (lead: LineLead) =>
    lead.route < 0 ? flow.nurture : (flow.managers[lead.route] ?? flow.nurture);

  const describe = (entry: JournalEntry) => {
    const lead = leads.find((l) => l.id === entry.leadId);
    if (!lead) return "";
    const fill = (template: string) =>
      template
        .replace("{channel}", flow.channels[lead.channel])
        .replace("{tone}", flow.tones[lead.tone])
        .replace("{priority}", flow.priorities[lead.priority])
        .replace("{route}", routeName(lead));
    return fill(lab.log[entry.kind]);
  };

  const columns = [...flow.managers.map((name, i) => ({ name, route: i })), { name: flow.nurture, route: -1 }];

  return (
    <Section id="flow-lab" flush className="py-band">
      <div ref={sectionRef} className="sheet">
        <div className="sheet-grid items-end gap-y-6 border-t border-ink pt-8 lg:pt-10">
          <TypeText
            as="h2"
            lines={lab.title}
            className="poster col-span-12 text-[clamp(3.4rem,8.4vw,9rem)] text-ink lg:col-span-7"
          />
          <div className="col-span-12 lg:col-span-5">
            <PrintLines text={lab.lede} className="max-w-[44ch] text-[clamp(1.15rem,1.5vw,1.4rem)] leading-[1.35] text-ink" />
            <p className="mt-4 max-w-[48ch] text-small text-ink-soft">{flow.brandNote}</p>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          {/* The composer. */}
          <form
            className="flex flex-col gap-7 lg:col-span-4"
            onSubmit={(event) => {
              event.preventDefault();
              submit(draft);
            }}
          >
            <fieldset>
              <legend className="mark text-cobalt">{lab.channelLabel}</legend>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {CHANNELS.map((option) => {
                  const on = option === channel;
                  return (
                    <label
                      key={option}
                      className={`cursor-pointer border-2 px-2 py-2 text-center text-small font-semibold transition-colors duration-200 ${on ? "border-ink bg-ink text-paper" : "border-rule text-ink hover:border-ink"}`}
                    >
                      <input
                        type="radio"
                        name="flow-channel"
                        value={option}
                        checked={on}
                        onChange={() => {
                          setChannel(option);
                          lastTouch.current = Date.now();
                        }}
                        className="sr-only"
                      />
                      {flow.channels[option]}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label htmlFor="flow-draft" className="mark text-cobalt">
                {lab.messageLabel}
              </label>
              <textarea
                id="flow-draft"
                rows={3}
                maxLength={140}
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  lastTouch.current = Date.now();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    submit(draft);
                  }
                }}
                placeholder={lab.placeholder}
                className="mt-3 block w-full resize-none border-2 border-ink bg-[#f8f7f3] p-3 text-copy text-ink placeholder:text-ink-mute focus:border-cobalt focus:outline-none"
              />
              <div className="mt-4">
                <InkButton onClick={() => submit(draft)}>{lab.send}</InkButton>
              </div>
            </div>

            <div>
              <p className="mark text-ink-mute">{lab.presetsLabel}</p>
              <ul className="mt-3 space-y-2">
                {lab.presets.map((preset) => (
                  <li key={preset}>
                    <button
                      type="button"
                      onClick={() => submit(preset)}
                      className="group flex w-full items-center justify-between gap-4 border-b border-rule py-2 text-left text-copy text-ink transition-colors hover:text-cobalt"
                    >
                      <span className="ink-link">{preset}</span>
                      <svg aria-hidden viewBox="0 0 20 12" className="w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1">
                        <path d="M0 6h18M13 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </form>

          {/* The machine. */}
          <div className="flex flex-col border-2 border-ink bg-[#f8f7f3] lg:col-span-8">
            <div className="flex items-center justify-between gap-4 border-b border-ink px-4 py-3">
              <p className="mark text-ink">North Flow</p>
              <p className="mark text-ink-mute">
                {waiting > 0 ? (
                  <>
                    <span className="text-cobalt">{waiting}</span> {lab.queued}
                  </>
                ) : autoRunning ? (
                  <span className="font-[family-name:var(--font-hand)] text-[1.35rem] leading-none font-semibold tracking-normal text-cobalt normal-case">
                    {lab.autoNote}
                  </span>
                ) : null}
              </p>
            </div>

            {/* The rail. */}
            <div className="relative h-64 overflow-hidden sm:h-[17rem]">
              <span className="absolute top-[64%] right-0 left-0 h-[3px] -translate-y-1/2 bg-cobalt" />
              {STATION_AT.map((at, k) => {
                const lit = active !== undefined && active.stage === k;
                return (
                  <span key={k} className="absolute top-[64%]" style={{ left: `${at}%` }}>
                    <span
                      className={`absolute -top-2 -left-2 block h-4 w-4 rounded-full border-[3px] border-cobalt transition-colors duration-300 ${lit ? "bg-cobalt" : "bg-[#f8f7f3]"}`}
                    />
                    <span className="mark absolute top-5 -translate-x-1/2 whitespace-nowrap text-ink max-sm:text-[0.6rem] max-sm:tracking-[0.02em]">
                      {flow.stations[k]}
                    </span>
                  </span>
                );
              })}

              {active && (
                <div
                  key={active.id}
                  className="absolute top-[64%] w-[9.5rem] -translate-x-1/2 -translate-y-[112%] animate-[captionIn_500ms_var(--ease-print)_both] transition-[left] duration-[800ms] ease-[var(--ease-print)] sm:w-[12.5rem]"
                  style={{ left: `clamp(4.9rem, ${STATION_AT[active.stage] ?? 87.5}%, calc(100% - 4.9rem))` }}
                >
                  <LeadCard lead={active} route={routeName(active)} />
                </div>
              )}
            </div>

            {/* The board. */}
            <div className="grid grid-cols-4 border-t border-ink">
              {columns.map((column, c) => {
                const mine = filed.filter((lead) => lead.route === column.route).reverse();
                return (
                  <div key={column.name} className={`min-h-48 p-2 sm:p-3 ${c > 0 ? "border-l border-rule" : ""}`}>
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`text-small font-bold ${column.route < 0 ? "text-ink-mute" : "text-ink"}`}>
                        {column.name}
                      </p>
                      <p className="poster text-[1.6rem] leading-none text-cobalt tabular-nums">{mine.length}</p>
                    </div>
                    <ul className="mt-2 space-y-1.5">
                      {mine.slice(0, 3).map((lead) => (
                        <li
                          key={lead.id}
                          className="animate-[captionIn_600ms_var(--ease-print)_both] border border-rule bg-paper p-1.5 sm:p-2"
                        >
                          <p className="flex items-center justify-between gap-1 font-[family-name:var(--font-mark)] text-[0.58rem] text-ink-mute uppercase">
                            <span className="truncate">{flow.channels[lead.channel]}</span>
                            {lead.mine && <span className="bg-cobalt px-1 text-paper">{lab.yours}</span>}
                          </p>
                          <p className="mt-1 line-clamp-2 hidden text-[0.74rem] leading-[1.25] text-ink sm:block">
                            {lead.text}
                          </p>
                        </li>
                      ))}
                      {mine.length > 3 && <li className="mark text-ink-mute">+{mine.length - 3}</li>}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* The journal. */}
            <div className="border-t border-ink px-4 py-3">
              <p className="mark text-cobalt">{lab.journalTitle}</p>
              <ol aria-live="polite" className="mt-2 min-h-[6.5rem] space-y-1 font-[family-name:var(--font-mark)] text-[0.72rem] leading-[1.35] text-ink">
                {journal.length === 0 && <li className="text-ink-mute">{lab.journalEmpty}</li>}
                {/* In night-clock order, so a queued enquiry does not read as travelling back in time. */}
                {[...journal]
                  .sort((a, b) => a.minute - b.minute || a.id - b.id)
                  .slice(-5)
                  .map((entry) => (
                    <li key={entry.id} className="flex animate-[captionIn_400ms_var(--ease-print)_both] gap-3">
                      <span className="shrink-0 text-ink-mute">{formatMinute(entry.minute)}</span>
                      <span className="truncate">{describe(entry)}</span>
                    </li>
                  ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function LeadCard({ lead, route }: { lead: LineLead; route: string }) {
  const copy = useCopy();
  const flow = copy.flowCase;

  return (
    <div className="flex flex-col gap-2 border border-rule bg-paper p-2.5 shadow-[0_16px_34px_-22px_rgb(18_18_17/0.6)] sm:p-3">
      <p className="flex items-center justify-between gap-2 font-[family-name:var(--font-mark)] text-[0.62rem] text-ink-mute uppercase">
        <span>{flow.channels[lead.channel]}</span>
        {lead.mine && <span className="bg-cobalt px-1 text-paper">{flow.lab.yours}</span>}
      </p>
      <p className="line-clamp-2 text-[0.8rem] leading-[1.25] font-semibold text-ink sm:text-[0.9rem]">{lead.text}</p>
      <div className="flex min-h-[1.6rem] items-end justify-between gap-2">
        <span
          className={`-rotate-3 border-[1.5px] px-1.5 font-[family-name:var(--font-mark)] text-[0.6rem] uppercase transition-[opacity,scale] duration-300 ${lead.tone === "warm" ? "border-cobalt text-cobalt" : "border-ink-mute text-ink-mute"} ${lead.stage >= 1 ? "scale-100 opacity-100" : "scale-150 opacity-0"}`}
        >
          {flow.tones[lead.tone]}
        </span>
        <span
          className="font-[family-name:var(--font-hand)] text-[1.15rem] leading-none font-semibold whitespace-nowrap text-cobalt transition-[clip-path] duration-500"
          style={{ clipPath: lead.stage >= 2 ? "inset(0 0 0 0)" : "inset(0 100% 0 0)" }}
        >
          {route}
        </span>
      </div>
    </div>
  );
}
