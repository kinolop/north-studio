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

/**
 * The hang: two equal columns of prints, all cut to the same 3:2. The right
 * column hangs a fixed drop lower than the left, so every pair zig-zags the
 * same way, the numbers read in order down the sheet, and no plate is left
 * floating in a hole. Below `lg` the prints simply stack.
 */
const SIZES = "(min-width: 1024px) 46vw, 100vw";

/**
 * The work, hung large.
 *
 * Every case gets a print big enough to read the site in it, captioned
 * underneath like a plate in a monograph: number, name, what it is. Each
 * one prints onto the sheet dot by dot the first time it comes into view.
 * The plates hung low rise a little faster than the page, so a row closes
 * up as you read it. Every cover is the case's own key picture rather than
 * a screenshot of its interface, so the wall reads as one set of prints.
 */
export function WorkPlates() {
  const copy = useCopy();
  const rootRef = useRef<HTMLDivElement>(null);

  const projects = copy.work.projects.filter((project) => CASES[project.key]);

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

        <ol className="sheet-grid mt-14 gap-y-14 lg:mt-[7vw] lg:gap-y-[5vw] lg:pb-[10vw]">
          {projects.map((project, index) => (
            <Plate key={project.key} project={project} index={index} cta={copy.work.caseCta} />
          ))}
        </ol>
      </div>
    </Section>
  );
}

function Plate({ project, index, cta }: { project: ProjectCopy; index: number; cta: string }) {
  const right = index % 2 === 1;
  const entry = CASES[project.key]!;

  const body = (
    <>
      <span className="relative block aspect-[3/2] overflow-hidden bg-paper-deep">
        <span data-print className="halftone absolute inset-0 block">
          <Image
            src={entry.cover}
            alt=""
            fill
            sizes={SIZES}
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

  const className = `group block ${right ? "lg:translate-y-[10vw] lg:pl-[2vw]" : "lg:pr-[2vw]"}`;
  const drift = right ? "" : undefined;

  return (
    <li className="col-span-12 lg:col-span-6">
      {entry.isStatic ? (
        <a href={entry.href} className={className} data-drift={drift}>
          {body}
        </a>
      ) : (
        <Link href={entry.href} className={className} data-drift={drift}>
          {body}
        </Link>
      )}
    </li>
  );
}
