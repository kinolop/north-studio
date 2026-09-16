"use client";

import { useState } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { TypeText } from "@/components/motion/TypeText";
import { Section } from "@/components/ui/Section";
import { remeasureSections } from "@/lib/scroll";

/**
 * Questions, one open at a time.
 *
 * The answer's height animates through `grid-template-rows: 0fr → 1fr`, so
 * nothing is measured in JavaScript and a long answer in one language
 * opens exactly as smoothly as a short one in the other.
 */
export function Questions() {
  const copy = useCopy();
  const [openKey, setOpenKey] = useState<string | null>(copy.questions.items[0]?.key ?? null);

  return (
    <Section id="questions" flush className="py-band">
      <div className="sheet sheet-grid gap-y-10">
        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <TypeText
              as="h2"
              lines={copy.questions.title}
              className="poster text-[clamp(4.5rem,9vw,9.5rem)] text-ink"
            />
          </div>
        </div>

        <ul className="col-span-12 border-t border-ink lg:col-span-8">
          {copy.questions.items.map((item) => {
            const isOpen = openKey === item.key;
            const panelId = `answer-${item.key}`;
            return (
              <li key={item.key} className="border-b border-rule">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => {
                    setOpenKey(isOpen ? null : item.key);
                    window.setTimeout(remeasureSections, 520);
                  }}
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left lg:py-7"
                >
                  <span className="text-[clamp(1.3rem,2.1vw,2rem)] leading-[1.15] font-semibold text-ink transition-colors group-hover:text-cobalt">
                    {item.q}
                  </span>
                  <span aria-hidden className="relative h-5 w-5 shrink-0">
                    <span className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 bg-ink" />
                    <span
                      className="absolute top-0 left-1/2 h-full w-[2px] -translate-x-1/2 bg-ink transition-transform duration-500 ease-[var(--ease-print)]"
                      style={{ transform: `translateX(-50%) scaleY(${isOpen ? 0 : 1})` }}
                    />
                  </span>
                </button>
                <div
                  id={panelId}
                  role="region"
                  className="grid transition-[grid-template-rows] duration-500 ease-[var(--ease-print)]"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[60ch] pb-7 text-copy text-ink-soft">{item.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
