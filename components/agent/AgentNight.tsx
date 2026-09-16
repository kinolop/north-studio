"use client";

import { useEffect, useRef, useState } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { PrintLines } from "@/components/motion/PrintLines";
import { TypeText } from "@/components/motion/TypeText";
import { Section } from "@/components/ui/Section";
import { useOnScreen } from "@/lib/useOnScreen";

type Mode = "without" | "with";

/**
 * One late enquiry, twice.
 *
 * A switch runs the same night with and without the agent: four moments
 * from 23:40 to the next morning, and how it ends. Without it, the ending
 * is struck through in cobalt; with it, it is ticked. If the visitor never
 * touches the switch, it flips itself once so the difference is seen.
 * No numbers are claimed here: it is the order of events that makes the
 * argument.
 */
export function AgentNight() {
  const copy = useCopy();
  const night = copy.agentCase.night;
  const rootRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(rootRef, "-25%");
  const [mode, setMode] = useState<Mode>("without");
  const touched = useRef(false);

  useEffect(() => {
    if (!onScreen || touched.current) return;
    const id = window.setTimeout(() => {
      if (!touched.current) setMode("with");
      touched.current = true;
    }, 5200);
    return () => window.clearTimeout(id);
  }, [onScreen]);

  const choose = (next: Mode) => {
    touched.current = true;
    setMode(next);
  };

  const moments = mode === "with" ? night.withMoments : night.withoutMoments;
  const good = mode === "with";

  return (
    <Section id="agent-night" flush className="py-band">
      <div ref={rootRef} className="sheet">
        <div className="sheet-grid items-start gap-y-12 border-t border-ink pt-8 lg:pt-10">
          <div className="col-span-12 lg:col-span-5">
            <TypeText as="h2" lines={night.title} className="poster text-[clamp(3.6rem,8.6vw,9rem)] text-ink" />
            <PrintLines text={night.lede} className="mt-6 max-w-[36ch] text-[clamp(1.15rem,1.5vw,1.4rem)] leading-[1.35] text-ink" />

            <div role="group" className="mt-10 inline-grid grid-cols-2 border-2 border-ink">
              {(["without", "with"] as const).map((option) => {
                const on = mode === option;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={on}
                    onClick={() => choose(option)}
                    className={`px-5 py-3 text-small font-semibold transition-colors duration-300 ${on ? (option === "with" ? "bg-cobalt text-paper" : "bg-ink text-paper") : "text-ink hover:bg-paper-deep"}`}
                  >
                    {night[option]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <ol key={mode} className="relative border-l-2 border-ink pl-6 sm:pl-8">
              {moments.map((moment, i) => (
                <li
                  key={`${mode}-${i}`}
                  className="relative grid animate-[captionIn_600ms_var(--ease-print)_both] grid-cols-[5.5rem_1fr] gap-4 pb-8 sm:grid-cols-[7rem_1fr]"
                  style={{ animationDelay: `${i * 170}ms` }}
                >
                  <span
                    aria-hidden
                    className={`absolute top-3 -left-[calc(1.5rem+7px)] h-3 w-3 border-2 sm:-left-[calc(2rem+7px)] ${good ? "border-cobalt bg-cobalt" : "border-ink bg-paper"}`}
                  />
                  <span className={`poster text-[clamp(2rem,3vw,2.8rem)] leading-none tabular-nums ${good ? "text-cobalt" : "text-ink-mute"}`}>
                    {moment.time}
                  </span>
                  <span className="pt-1 text-copy text-ink">{moment.text}</span>
                </li>
              ))}
              <li
                className="relative animate-[captionIn_600ms_var(--ease-print)_both] pt-2"
                style={{ animationDelay: `${moments.length * 170 + 200}ms` }}
              >
                <span className="relative inline-flex items-center gap-3 text-[clamp(1.8rem,3vw,2.8rem)] leading-none font-bold text-ink">
                  {good && (
                    <svg aria-hidden viewBox="0 0 48 40" className="h-9 w-11 overflow-visible">
                      <path d="M4 22 C 9 26, 12 31, 15 34 C 22 22, 32 11, 44 4" fill="none" stroke="var(--color-cobalt)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {good ? night.withVerdict : night.withoutVerdict}
                  {!good && (
                    <svg aria-hidden viewBox="0 0 100 12" preserveAspectRatio="none" className="pointer-events-none absolute top-[48%] -left-[2%] h-[0.3em] w-[104%] overflow-visible">
                      <path
                        d="M0 7 C 12 3, 24 9, 38 6 S 62 3, 76 7 S 94 5, 100 4"
                        fill="none"
                        stroke="var(--color-cobalt)"
                        strokeWidth="0.12em"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        className="night-strike"
                      />
                    </svg>
                  )}
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </Section>
  );
}
