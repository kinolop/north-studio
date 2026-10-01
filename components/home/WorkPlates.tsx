"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { PrintLines } from "@/components/motion/PrintLines";
import { TypeText } from "@/components/motion/TypeText";
import { Section } from "@/components/ui/Section";
import { CASES } from "@/lib/cases";
import type { ProjectCopy } from "@/lib/i18n/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Slot {
  /** Grid columns, plus the drop that keeps it off its neighbour's line. */
  readonly place: string;
  readonly frame: string;
  readonly sizes: string;
  /** Dropped plates rise against the scroll to meet their neighbour. */
  readonly drift?: boolean;
}

const WIDE = "(min-width: 1024px) 50vw, 100vw";
const NARROW = "(min-width: 1024px) 34vw, 100vw";
const TALL = "(min-width: 1024px) 34vw, 75vw";

/**
 * The hang, row by row, the way an architect pins prints to a wall: two to
 * a row and never level with each other, so the eye zig-zags down the sheet
 * instead of reading a grid. Rows take the projects in the order the copy
 * lists them; a project past the last row starts the pattern again.
 *
 * Below `lg` every plate stacks; the portraits alternate sides so the
 * column still walks.
 */
const ROWS: readonly (readonly Slot[])[] = [
  [
    { place: "col-span-12 lg:col-span-6", frame: "aspect-[3/2]", sizes: WIDE },
    { place: "col-span-12 lg:col-start-8 lg:col-span-5 lg:mt-[16vw]", frame: "aspect-[3/2]", sizes: WIDE, drift: true },
  ],
  [
    { place: "col-span-12 lg:col-start-3 lg:col-span-5 lg:mt-[12vw]", frame: "aspect-[3/2]", sizes: WIDE, drift: true },
    { place: "col-span-12 lg:col-start-9 lg:col-span-4", frame: "aspect-[3/2]", sizes: NARROW },
  ],
  [
    {
      place: "col-span-12 lg:col-start-5 lg:col-span-8",
      // A screen, not a photograph: framed at its own proportion so no
      // edge of the interface is cropped away.
      frame: "aspect-[27/16]",
      sizes: "(min-width: 1024px) 66vw, 100vw",
    },
  ],
  [
    { place: "col-span-9 lg:col-start-2 lg:col-span-4", frame: "aspect-[4/5]", sizes: TALL },
    {
      place: "col-span-9 col-start-4 lg:col-start-8 lg:col-span-4 lg:mt-[18vw]",
      frame: "aspect-[4/5]",
      sizes: TALL,
      drift: true,
    },
  ],
];

interface Hung {
  readonly plate: Slot;
  readonly project: ProjectCopy;
  readonly index: number;
}

function hang(projects: readonly ProjectCopy[]): Hung[][] {
  const rows: Hung[][] = [];
  for (let start = 0, r = 0; start < projects.length; r += 1) {
    const pattern = ROWS[r % ROWS.length]!;
    rows.push(
      projects.slice(start, start + pattern.length).map((project, k) => ({
        plate: pattern[k]!,
        project,
        index: start + k,
      })),
    );
    start += pattern.length;
  }
  return rows;
}

/**
 * The work, hung large.
 *
 * Every case gets a print big enough to read the site in it, captioned
 * underneath like a plate in a monograph: number, name, what it is. Each
 * one prints onto the sheet dot by dot the first time it comes into view.
 * The plates hung low rise a little faster than the page, so a row closes
 * up as you read it. The prints themselves are never cropped by the
 * motion: half the covers are screens, and a cut-off headline reads as
 * a mistake.
 */
export function WorkPlates() {
  const copy = useCopy();
  const rootRef = useRef<HTMLDivElement>(null);

  const projects = copy.work.projects.filter((project) => CASES[project.key]);
  const rows = hang(projects);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      // Set on the node rather than through React, so a re-render (a
      // language switch) never takes back a print that already happened.
      const seen = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            (entry.target as HTMLElement).dataset.printed = "true";
            seen.unobserve(entry.target);
          }
        },
        { rootMargin: "0px 0px -12% 0px" },
      );
      root.querySelectorAll("[data-print]").forEach((node) => seen.observe(node));

      // Only where the plates hang side by side; stacked, there is no
      // neighbour to rise towards.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-drift]", root).forEach((plate) => {
          gsap.fromTo(
            plate,
            { y: 90 },
            {
              y: -90,
              ease: "none",
              scrollTrigger: { trigger: plate, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });
      });

      return () => {
        seen.disconnect();
        mm.revert();
      };
    },
    { scope: rootRef, dependencies: [projects.length] },
  );

  return (
    <Section id="work" flush className="py-band">
      <div ref={rootRef} className="sheet">
        <div className="sheet-grid items-end gap-y-8 border-t border-ink pt-8 lg:pt-10">
          <div className="col-span-12 flex items-start gap-[0.4em] lg:col-span-8">
            <TypeText
              as="h2"
              lines={copy.work.title}
              className="poster text-[clamp(5rem,15vw,16rem)] text-ink"
            />
            <span className="poster mt-[0.15em] text-[clamp(1.5rem,3.4vw,3.6rem)] text-ink-soft">
              ({String(projects.length).padStart(2, "0")})
            </span>
          </div>
          <PrintLines
            text={copy.work.lede}
            className="col-span-12 max-w-[40ch] text-[clamp(1.2rem,1.6vw,1.5rem)] leading-[1.35] text-ink lg:col-span-4"
          />
        </div>

        {rows.map((row, r) => (
          <div
            key={r}
            className={`sheet-grid items-start gap-y-16 lg:gap-y-0 ${r === 0 ? "mt-14 lg:mt-[7vw]" : "mt-16 lg:mt-[9vw]"}`}
          >
            {row.map(({ plate, project, index }) => (
              <Plate key={project.key} plate={plate} project={project} index={index} cta={copy.work.caseCta} />
            ))}
          </div>
        ))}
      </div>
    </Section>
  );
}

function Plate({
  plate,
  project,
  index,
  cta,
}: {
  plate: Slot;
  project: ProjectCopy;
  index: number;
  cta: string;
}) {
  const entry = CASES[project.key]!;

  const body = (
    <>
      <span className={`relative block overflow-hidden bg-paper-deep ${plate.frame}`}>
        <span data-print className="halftone absolute inset-0 block">
          <Image
            src={entry.cover}
            alt=""
            fill
            sizes={plate.sizes}
            className="object-cover transition-[scale] duration-[1100ms] ease-[var(--ease-print)] group-hover:scale-[1.035]"
          />
        </span>
      </span>

      <span className="mt-4 flex items-baseline justify-between gap-6">
        <span className="flex items-baseline gap-3">
          <span className="mark text-ink-mute">{String(index + 1).padStart(2, "0")}</span>
          <span className="text-[clamp(1.2rem,1.5vw,1.55rem)] leading-tight font-bold tracking-[-0.02em] text-ink transition-colors duration-300 group-hover:text-cobalt">
            {project.name}
          </span>
        </span>
        {/* On hover the discipline rolls up and the way in rolls after it. */}
        <span className="relative block overflow-hidden text-right text-small">
          <span className="block text-ink-soft transition-transform duration-500 ease-[var(--ease-print)] group-hover:-translate-y-full">
            {project.discipline}
          </span>
          <span
            aria-hidden
            className="absolute inset-0 flex translate-y-full items-center justify-end gap-1.5 font-semibold text-cobalt transition-transform duration-500 ease-[var(--ease-print)] group-hover:translate-y-0"
          >
            {cta}
            <svg viewBox="0 0 24 24" className="h-4 w-4">
              <path d="M5 19 19 5M8 5h11v11" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </span>
        </span>
      </span>
    </>
  );

  const className = `group block ${plate.place}`;
  const drift = plate.drift ? "" : undefined;

  return entry.isStatic ? (
    <a href={entry.href} className={className} data-drift={drift}>
      {body}
    </a>
  ) : (
    <Link href={entry.href} className={className} data-drift={drift}>
      {body}
    </Link>
  );
}
