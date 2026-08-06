"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { useCopy } from "@/components/i18n/CopyProvider";
import { remeasureSections } from "@/lib/scroll";
import { SECTIONS } from "@/lib/sections";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const meta = SECTIONS[6];

/**
 * The page's only pinned section.
 *
 * The skill data is explicit that more than one or two pins on a page
 * starts fighting native scroll, so this is where the budget gets spent:
 * four movements, scrubbed, with the earlier ones staying on screen at
 * reduced weight so the process visibly accumulates rather than replacing
 * itself.
 *
 * Everything renders fully visible in the markup. GSAP dims the steps only
 * after it has confirmed it is allowed to animate, which means no-JS,
 * reduced-motion and mobile all get a plain, complete, readable list.
 */
export function Process() {
  const rootRef = useRef<HTMLDivElement>(null);
  const copy = useCopy();
  const process = copy.process;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const steps = gsap.utils.toArray<HTMLElement>("[data-step]", root);
      const counters = gsap.utils.toArray<HTMLElement>("[data-counter]", root);
      const progress = root.querySelector<HTMLElement>("[data-progress]");
      if (steps.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.set(steps, { opacity: 0.16, y: 34 });
          gsap.set(steps[0] as HTMLElement, { opacity: 1, y: 0 });
          // Counters sit stacked in one window; all but the first start
          // parked below it.
          gsap.set(counters, { yPercent: 0 });
          gsap.set(counters.slice(1), { yPercent: 110 });
          gsap.set(progress, { scaleY: 1 / steps.length });

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: `+=${steps.length * 78}%`,
              scrub: 0.85,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          steps.forEach((step, index) => {
            if (index === 0) return;
            const at = index - 1;

            timeline
              .to(steps[index - 1] as HTMLElement, { opacity: 0.16, y: -18, duration: 0.5 }, at)
              .to(step, { opacity: 1, y: 0, duration: 0.5 }, at + 0.1)
              .to(counters[index - 1] as HTMLElement, { yPercent: -110, duration: 0.4 }, at)
              .to(counters[index] as HTMLElement, { yPercent: 0, duration: 0.4 }, at)
              .to(
                progress,
                { scaleY: (index + 1) / steps.length, duration: 0.5 },
                at,
              );
          });

          // The pin changes document height, so the scroll store's cached
          // section offsets are stale until it is told otherwise.
          ScrollTrigger.addEventListener("refresh", remeasureSections);

          return () => {
            ScrollTrigger.removeEventListener("refresh", remeasureSections);
          };
        },
      );

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <Section id={meta.id}>
      {/* A pinned panel that does not fit the viewport silently crops its own
          last step. min-h-dvh with no extra padding, and tightened step
          spacing, keeps all four movements on screen for the whole scrub. */}
      <div ref={rootRef} className="container-north lg:flex lg:min-h-dvh lg:items-center">
        <div className="grid w-full gap-14 lg:grid-cols-12 lg:gap-8">
          {/* Centred against the step list so the shorter column does not
              leave a column of void beneath it. */}
          <div className="lg:col-span-5 lg:flex lg:flex-col lg:justify-center">
            <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
            <SplitLines
              as="h2"
              lines={process.title}
              className="mt-8 text-display font-display font-medium text-bone"
            />
            <p className="mt-8 max-w-[36ch] text-body text-ash">{process.lede}</p>

            {/* Movement counter. Four readouts stacked in one overflow
                window and slid through by the timeline — crossfading them
                left two numbers legible on top of each other at every
                midpoint of the scrub. No React state in a scrub loop. */}
            {/* `lg:motion-safe:flex` rather than `lg:flex`: the counter only
                means anything while the timeline is driving it, and without
                that the four readouts render stacked on top of each other. */}
            <div className="mt-12 hidden items-baseline gap-4 lg:motion-safe:flex">
              <span className="relative block h-[3.2rem] w-[4.6rem] overflow-hidden">
                {process.steps.map((step, index) => (
                  <span
                    key={step.key}
                    data-counter
                    className="text-chrome absolute inset-0 font-display text-[3.2rem] leading-none font-semibold [font-variation-settings:'wdth'_118]"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                ))}
              </span>
              <span className="label-mono">
                {process.ofLabel} {String(process.steps.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="relative lg:col-span-6 lg:col-start-7">
            {/* Track and its filled length. */}
            <div
              aria-hidden
              className="absolute top-0 left-0 hidden h-full w-px bg-hairline lg:block"
            >
              <div
                data-progress
                className="h-full w-full origin-top bg-[linear-gradient(180deg,var(--color-signal),rgb(167_155_255/0.35))]"
              />
            </div>

            <ol className="space-y-12 lg:space-y-7 lg:pl-12">
              {process.steps.map((step, index) => (
                <li key={step.key} data-step>
                  <div className="flex items-baseline gap-5">
                    <span className="label-mono text-signal-lift">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-title font-display font-medium text-bone">
                      {step.name}
                    </h3>
                  </div>
                  <p className="mt-5 max-w-[48ch] text-body text-ash lg:pl-[3.1rem]">
                    {step.body}
                  </p>
                  {/* Stacked on narrow screens: at label tracking this pair
                      wraps mid-phrase if it is forced onto one line. */}
                  <p className="label-mono mt-5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2 lg:pl-[3.1rem]">
                    <span className="text-slate">{process.leavesYouWith}</span>
                    <span aria-hidden className="hidden text-hairline sm:inline">
                      /
                    </span>
                    <span className="text-ash">{step.artifact}</span>
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Section>
  );
}
