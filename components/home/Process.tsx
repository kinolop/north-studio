"use client";

import { useRef } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { PrintLines } from "@/components/motion/PrintLines";
import { TypeText } from "@/components/motion/TypeText";
import { Section } from "@/components/ui/Section";
import type { StepCopy } from "@/lib/i18n/types";
import { useReveal } from "@/lib/useReveal";

/**
 * Four steps, each standing on its own rule.
 *
 * The numerals are set far larger than their row and cut off by the line
 * they stand on, fading into the paper as they go down. When a step comes
 * into view its numeral turns over like a split-flap board, running up
 * through the digits before it lands on its own. They climb a staircase
 * across the grid; the prose holds one column so it reads straight down.
 */
export function Process() {
  const copy = useCopy();
  const process = copy.process;

  return (
    <Section id="process" flush className="py-band">
      <div className="sheet">
        <div className="grid gap-y-6 border-t border-ink pt-8 lg:grid-cols-[1fr_auto] lg:items-end lg:pt-10">
          <TypeText
            as="h2"
            lines={process.title}
            className="poster text-[clamp(4.5rem,11vw,11.5rem)] text-ink"
          />
          <p className="max-w-[26ch] font-[family-name:var(--font-hand)] text-[clamp(1.8rem,2.4vw,2.5rem)] leading-[1.05] font-semibold text-cobalt lg:mb-4 lg:-rotate-2 lg:text-right">
            {process.lede}
          </p>
        </div>

        <ol className="mt-16 lg:mt-24">
          {process.steps.map((step, index) => (
            <Step key={step.key} step={step} index={index} leavesYouWith={process.leavesYouWith} />
          ))}
        </ol>
      </div>
    </Section>
  );
}

const STAIR = ["lg:col-start-1", "lg:col-start-2", "lg:col-start-3", "lg:col-start-4"];
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

function Step({
  step,
  index,
  leavesYouWith,
}: {
  step: StepCopy;
  index: number;
  leavesYouWith: string;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const phase = useReveal(ref);
  const number = index + 1;
  // Parked a full turn below its value, so it rolls up through the digits.
  const rest = phase === "armed" ? 0 : number;

  return (
    <li ref={ref} className="border-b-2 border-ink pt-10 first:pt-0 lg:pt-14">
      <div className="sheet-grid items-end gap-y-6">
        <div className={`col-span-12 lg:col-span-5 ${STAIR[index] ?? ""}`}>
          <TypeText
            as="h3"
            lines={[step.name]}
            speed={55}
            className="text-[clamp(1.35rem,2vw,1.9rem)] leading-[1.1] font-semibold text-ink"
          />
          <div
            aria-hidden
            className="poster mt-2 flex h-[0.64em] overflow-hidden text-[clamp(8.5rem,21vw,19rem)] leading-[0.8] text-cobalt [mask-image:linear-gradient(180deg,#000_28%,transparent_96%)]"
          >
            <span>0</span>
            <span className="relative block">
              <span
                className="block"
                style={{
                  transform: `translate3d(0, ${-rest * 10}%, 0)`,
                  transition:
                    phase === "in"
                      ? `transform ${1400 + index * 150}ms cubic-bezier(0.16, 1, 0.3, 1)`
                      : "none",
                }}
              >
                {DIGITS.map((digit) => (
                  <span key={digit} className="block h-[0.8em]">
                    {digit}
                  </span>
                ))}
              </span>
            </span>
          </div>
        </div>

        <div className="col-span-12 pb-8 lg:col-span-4 lg:col-start-9 lg:pb-10">
          <PrintLines text={step.body} className="text-copy text-ink" />
          <p className="mt-4 text-small text-ink-soft">
            <span className="font-semibold text-ink">{leavesYouWith}:</span> {step.artifact}
          </p>
        </div>
      </div>
    </li>
  );
}
