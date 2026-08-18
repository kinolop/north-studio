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
  noctura: "/work/noctura",
};

/**
 * Card covers, keyed the same way and for the same reason. Each one lives
 * beside the case it belongs to rather than in a shared covers folder, so a
 * fourth case arrives as one self-contained directory.
 */
const CASE_COVERS: Readonly<Record<string, string>> = {
  "north-agent": "/work/north-agent/assets/cover.png",
  "north-flow": "/work/north-flow/assets/cover.png",
  orbita: "/work/orbita/assets/cover.png",
  noctura: "/work/noctura/assets/cover.png",
};

export function Work() {
  const copy = useCopy();
  const [featured, ...rest] = copy.work.projects;

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
          </Reveal>
        </div>

        {/* Four cases, all of them real, all of them open. The flagship
            takes the full width and the other three share the row beneath
            it. That row goes straight from one column to three: at two
            columns the odd card would strand a hole on the second row, and
            a visible gap reads as a case that failed to load. */}
        <div className="mt-20 space-y-5">
          {featured && (
            <WorkCard
              project={featured}
              variant="lead"
              href={CASE_PAGES[featured.key]}
              cover={CASE_COVERS[featured.key]}
              cta={copy.work.caseCta}
            />
          )}

          <div className="grid gap-5 lg:grid-cols-3">
            {rest.map((project, index) => (
              <WorkCard
                key={project.key}
                project={project}
                delay={0.08 * (index + 1)}
                href={CASE_PAGES[project.key]}
                cover={CASE_COVERS[project.key]}
                cta={copy.work.caseCta}
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
