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
 *
 * Three are routes in this app. The two client cases are not: they are the
 * static pages that were delivered to those clients, served whole out of
 * `public/work/<slug>/` and rewritten onto these clean URLs in
 * `next.config.ts`. A plain `<Link>` still reaches them — the router just
 * hands the address to the browser instead of rendering it.
 */
const CASE_PAGES: Readonly<Record<string, string>> = {
  "north-agent": "/work/north-agent",
  "north-flow": "/work/north-flow",
  domstroy: "/work/domstroy",
  "dental-clinic": "/work/dental-clinic",
  noctura: "/work/noctura",
};

/**
 * Card covers, keyed the same way and for the same reason. Each one lives
 * beside the case it belongs to rather than in a shared covers folder, so a
 * fourth case arrives as one self-contained directory.
 */
/**
 * The cases that are not routes in this app, so the cards linking to them
 * ask the browser for a full page load rather than the router for a payload
 * that does not exist. Same slugs as `STATIC_CASES` in `next.config.ts`,
 * which is what puts them on these URLs in the first place.
 */
const STATIC_CASES: ReadonlySet<string> = new Set(["domstroy", "dental-clinic"]);

const CASE_COVERS: Readonly<Record<string, string>> = {
  "north-agent": "/work/north-agent/assets/cover.png",
  "north-flow": "/work/north-flow/assets/cover.png",
  // The two client cases shipped as finished pages rather than as case
  // studies, so neither has a cover drawn for this grid. Each one's hero
  // photograph is the first thing the page itself shows and crops correctly
  // at both card ratios, so it stands in rather than a near-copy of itself
  // saved under a second name.
  domstroy: "/work/domstroy/images/hero.jpg",
  "dental-clinic": "/work/dental-clinic/images/hero-clinic.png",
  noctura: "/work/noctura/assets/cover.png",
};

export function Work() {
  const copy = useCopy();
  const [featured, ...rest] = copy.work.projects;

  /**
   * The tail row must never leave a hole: an empty cell in a grid of cases
   * reads as a case that failed to load.
   *
   * Three cases go straight from one column to three, because at two the odd
   * one strands a gap. Four divide cleanly at two and at four, so they take
   * both and skip three entirely. Any other count falls back to the
   * three-column rhythm — and if the list ever grows to a number that does
   * not divide, this is the line to fix.
   */
  const tailColumns =
    rest.length === 4 ? "sm:grid-cols-2 xl:grid-cols-4" : "lg:grid-cols-3";

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

        {/* Five cases, all of them real, all of them open. The flagship
            takes the full width and the rest share the rows beneath it —
            see `tailColumns` for why that grid counts its own cards. */}
        <div className="mt-20 space-y-5">
          {featured && (
            <WorkCard
              project={featured}
              variant="lead"
              href={CASE_PAGES[featured.key]}
              external={STATIC_CASES.has(featured.key)}
              cover={CASE_COVERS[featured.key]}
              cta={copy.work.caseCta}
            />
          )}

          <div className={`grid gap-5 ${tailColumns}`}>
            {rest.map((project, index) => (
              <WorkCard
                key={project.key}
                project={project}
                delay={0.08 * (index + 1)}
                href={CASE_PAGES[project.key]}
                external={STATIC_CASES.has(project.key)}
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
