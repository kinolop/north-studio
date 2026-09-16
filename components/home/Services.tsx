"use client";

import { useState } from "react";

import { useChannelOverlay } from "@/components/contact/ChannelOverlayProvider";
import { useCopy } from "@/components/i18n/CopyProvider";
import { PrintLines } from "@/components/motion/PrintLines";
import { TypeText } from "@/components/motion/TypeText";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { remeasureSections } from "@/lib/scroll";

import { InkButton } from "./InkButton";
import { WireDiagram, type WireGroup } from "./WireDiagram";

/**
 * Three jobs, shown as one system: the wiring on top, the three services
 * as an index underneath. Each row opens in place into the whole story:
 * what people come with, what I do about it, what they end up with and
 * how long it takes. Reaching for a row lights its part of the wiring.
 */
export function Services() {
  const copy = useCopy();
  const { open } = useChannelOverlay();
  const services = copy.services;
  const [hover, setHover] = useState<WireGroup | null>(null);
  const [expanded, setExpanded] = useState<WireGroup | null>("sites");

  const toggle = (key: WireGroup) => {
    setExpanded((current) => (current === key ? null : key));
    window.setTimeout(remeasureSections, 650);
  };

  return (
    <Section id="services" flush className="py-band">
      <div className="sheet">
        {/* Title across the sheet, the lede tucked under its second line:
            one block of type rather than a headline beside a paragraph. */}
        <div className="border-t border-ink pt-8 lg:pt-10">
          <TypeText
            as="h2"
            lines={services.title}
            className="poster text-[clamp(4.5rem,13vw,14rem)] text-ink"
          />
          <div className="sheet-grid mt-6 lg:-mt-[4.2vw]">
            <PrintLines
              text={services.lede}
              className="col-span-12 max-w-[42ch] text-[clamp(1.2rem,1.6vw,1.5rem)] leading-[1.35] text-ink sm:col-span-9 lg:col-span-5 lg:col-start-8"
            />
          </div>
        </div>

        <Reveal className="mt-14 border-y border-rule py-8 lg:mt-20 lg:py-10" distance={0}>
          <WireDiagram
            inputs={services.diagram.inputs}
            outputs={services.diagram.outputs}
            core={services.diagram.core}
            label={services.diagram.label}
            focus={hover ?? expanded}
          />
        </Reveal>

        <ol className="mt-4 border-t-2 border-ink" onPointerLeave={() => setHover(null)}>
          {services.items.map((service) => {
            const isOpen = expanded === service.key;
            const panelId = `service-${service.key}`;
            return (
              <li key={service.key} className="border-b border-ink">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(service.key)}
                  onPointerEnter={() => setHover(service.key)}
                  onFocus={() => setHover(service.key)}
                  onBlur={() => setHover(null)}
                  className="group relative isolate block w-full text-left"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-paper-deep transition-transform duration-500 ease-[var(--ease-print)] group-hover:scale-y-100"
                  />
                  <span className="sheet-grid items-center gap-y-3 py-6 lg:py-8">
                    <span
                      className={`poster col-span-10 text-[clamp(2.8rem,6.2vw,7rem)] transition-[transform,color] duration-500 ease-[var(--ease-print)] group-hover:translate-x-3 sm:col-span-10 lg:col-span-7 ${isOpen ? "text-cobalt" : "text-ink"}`}
                    >
                      {service.short}
                    </span>
                    <span className="col-span-12 hidden text-copy text-ink-soft lg:col-span-4 lg:col-start-8 lg:block">
                      {service.summary}
                    </span>
                    <span aria-hidden className="col-span-2 flex justify-end lg:col-span-1">
                      <span className="relative block h-7 w-7">
                        <span className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 bg-ink" />
                        <span
                          className="absolute top-0 left-1/2 h-full w-[2px] bg-ink transition-transform duration-500 ease-[var(--ease-print)]"
                          style={{ transform: `translateX(-50%) scaleY(${isOpen ? 0 : 1})` }}
                        />
                      </span>
                    </span>
                  </span>
                </button>

                <div
                  id={panelId}
                  role="region"
                  aria-label={service.name}
                  className="grid transition-[grid-template-rows] duration-[650ms] ease-[var(--ease-print)]"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="sheet-grid gap-y-8 pt-2 pb-10 lg:pb-14">
                      <p className="col-span-12 text-copy text-ink-soft lg:hidden">{service.summary}</p>

                      <div className="col-span-12 sm:col-span-6 lg:col-span-3 lg:col-start-2">
                        <p className="mark text-cobalt">{services.labels.problem}</p>
                        <p className="mt-3 text-copy text-ink">{service.problem}</p>
                      </div>

                      <div className="col-span-12 sm:col-span-6 lg:col-span-4">
                        <p className="mark text-cobalt">{services.labels.what}</p>
                        <ol className="mt-3 space-y-2.5">
                          {service.what.map((step, i) => (
                            <li key={step} className="grid grid-cols-[1.6rem_1fr] text-copy text-ink">
                              <span className="mark pt-[0.35em] text-ink-mute">{i + 1}</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="col-span-12 flex flex-col gap-6 border-l-2 border-cobalt pl-5 sm:col-span-12 lg:col-span-4">
                        <div>
                          <p className="mark text-cobalt">{services.labels.result}</p>
                          <p className="mt-3 text-[clamp(1.2rem,1.5vw,1.45rem)] leading-[1.3] font-semibold text-ink">
                            {service.result}
                          </p>
                        </div>
                        <div>
                          <p className="mark text-cobalt">{services.labels.term}</p>
                          <p className="mt-2 text-copy text-ink">{service.term}</p>
                        </div>
                        <div>
                          <InkButton onClick={() => open()}>{services.discuss}</InkButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
