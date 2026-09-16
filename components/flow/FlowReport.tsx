"use client";

import { useCopy } from "@/components/i18n/CopyProvider";
import { PrintLines } from "@/components/motion/PrintLines";
import { TypeText } from "@/components/motion/TypeText";
import { LogoMark } from "@/components/paper/Logo";
import { Section } from "@/components/ui/Section";
import { STATION_COUNT } from "@/lib/flowLine";

import { useFlowLine } from "./FlowLineStore";

/**
 * The morning after, built from this page.
 *
 * Every figure on the report is counted from the enquiries that actually
 * went down the line above, the visitor's own included, so the last thing
 * the demo shows is the one thing an owner would open first. Per manager
 * the count is kept as tally marks, the way it would be on paper.
 */
export function FlowReport() {
  const copy = useCopy();
  const flow = copy.flowCase;
  const report = flow.report;
  const { leads, reset } = useFlowLine();

  const filed = leads.filter((lead) => lead.stage >= STATION_COUNT);
  const warm = filed.filter((lead) => lead.tone === "warm").length;
  const cold = filed.length - warm;
  const yours = filed.filter((lead) => lead.mine).length;
  const perManager = flow.managers.map((name, route) => ({
    name,
    count: filed.filter((lead) => lead.route === route).length,
  }));

  const rows = [
    { label: report.processed, value: filed.length, strong: true },
    { label: report.warm, value: warm },
    { label: report.cold, value: cold },
    { label: report.yours, value: yours },
    { label: report.lost, value: 0 },
  ];

  return (
    <Section id="flow-report" flush className="py-band">
      <div className="sheet">
        <div className="sheet-grid items-center gap-y-12 border-t border-ink pt-8 lg:pt-10">
          <div className="col-span-12 lg:col-span-5">
            <TypeText as="h2" lines={report.title} className="poster text-[clamp(2.8rem,5.4vw,6rem)] text-ink" />
            <PrintLines
              text={report.lede}
              className="mt-6 max-w-[40ch] text-[clamp(1.15rem,1.5vw,1.4rem)] leading-[1.35] text-ink"
            />
            <button
              type="button"
              onClick={reset}
              className="mark ink-link mt-8 text-ink-soft hover:text-ink"
            >
              {report.reset}
            </button>
          </div>

          <div className="col-span-12 flex justify-center lg:col-span-6 lg:col-start-7">
            <article className="relative w-full max-w-[30rem] -rotate-[1.6deg] border-2 border-ink bg-[#f8f7f3] shadow-[0_40px_80px_-50px_rgb(18_18_17/0.7)]">
              {/* A strip of cobalt tape holding the note to the page. */}
              <span
                aria-hidden
                className="absolute -top-3 left-1/2 h-6 w-28 -translate-x-1/2 rotate-[3deg] bg-cobalt/85"
              />
              <header className="flex items-center justify-between gap-4 border-b border-ink px-5 py-4">
                <span className="flex items-center gap-3">
                  <LogoMark className="h-7 w-7" />
                  <span className="text-small font-bold text-ink">{report.heading}</span>
                </span>
                <span className="mark text-ink-mute">{report.time}</span>
              </header>

              <dl className="px-5 py-3">
                {rows.map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-4 border-b border-rule py-2.5 last:border-b-0">
                    <dt className={`text-copy ${row.strong ? "font-bold text-ink" : "text-ink-soft"}`}>{row.label}</dt>
                    <dd
                      key={row.value}
                      className="poster animate-[captionIn_500ms_var(--ease-print)_both] text-[2.2rem] leading-none text-cobalt tabular-nums"
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="border-t border-ink px-5 py-4">
                <p className="mark text-cobalt">{report.byManager}</p>
                <ul className="mt-3 space-y-2">
                  {perManager.map((manager) => (
                    <li key={manager.name} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3">
                      <span className="text-small font-semibold text-ink">{manager.name}</span>
                      <Tally count={manager.count} />
                      <span className="mark text-ink-mute tabular-nums">{manager.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </div>
        </div>
      </div>
    </Section>
  );
}

/** Groups of five, the fifth struck through the first four. */
function Tally({ count }: { count: number }) {
  const shown = Math.min(count, 20);
  const groups = Math.ceil(shown / 5);
  return (
    <svg aria-hidden viewBox={`0 0 ${Math.max(groups, 1) * 30} 22`} className="h-5 w-auto overflow-visible">
      {Array.from({ length: groups }, (_, g) => {
        const inGroup = Math.min(5, shown - g * 5);
        const x0 = g * 30;
        return (
          <g key={g} stroke="var(--color-cobalt)" strokeWidth="2.2" strokeLinecap="round">
            {Array.from({ length: Math.min(inGroup, 4) }, (_, i) => (
              <line key={i} x1={x0 + 3 + i * 5} y1={3 + (i % 2)} x2={x0 + 2 + i * 5} y2={19 - (i % 2)} />
            ))}
            {inGroup === 5 && <line x1={x0} y1={17} x2={x0 + 22} y2={5} />}
          </g>
        );
      })}
    </svg>
  );
}
