"use client";

import { useCopy } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { sectionById } from "@/lib/sections";

import { WorkCard } from "./WorkCard";

const meta = sectionById("work");

/**
 * Which projects have a page behind them. Keyed rather than positional, so
 * reordering the dictionary can never point a card at the wrong case.
 */
const CASE_PAGES: Readonly<Record<string, string>> = {
  "north-agent": "/work/north-agent",
  "north-flow": "/work/north-flow",
  orbita: "/work/orbita",
};

export function Work() {
  const copy = useCopy();
  const [featured, second, third, ...rest] = copy.work.projects;

  return (
    <Section id={meta.id}>
      <div className="container-north">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
            <SplitLines
              as="h2"
              lines={copy.work.title}
              className="mt-8 text-display font-display font-medium text-bone"
            />
          </div>

          <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.08}>
            <p className="max-w-[42ch] text-body text-ash">{copy.work.lede}</p>
            <p className="label-mono mt-7 text-slate">{copy.work.placeholderNote}</p>
          </Reveal>
        </div>

        {/* The three cases with a page behind them get the full width,
            alternating sides so the run reads as a spread rather than a
            list. The client work sits below, three up. */}
        <div className="mt-20 space-y-5">
          {featured && (
            <WorkCard
              project={featured}
              variant="lead"
              href={CASE_PAGES[featured.key]}
              cta={copy.work.caseCta}
            />
          )}

          {second && (
            <WorkCard
              project={second}
              variant="lead"
              mirrored
              delay={0.06}
              href={CASE_PAGES[second.key]}
              cta={copy.work.caseCta}
            />
          )}

          {third && (
            <WorkCard
              project={third}
              variant="lead"
              delay={0.06}
              href={CASE_PAGES[third.key]}
              cta={copy.work.caseCta}
            />
          )}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((project, index) => (
              <WorkCard
                key={project.key}
                project={project}
                delay={0.08 * (index + 1)}
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
