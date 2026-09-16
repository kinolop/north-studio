"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { PrintLines } from "@/components/motion/PrintLines";
import { TypeText } from "@/components/motion/TypeText";
import { Section } from "@/components/ui/Section";
import { CASES } from "@/lib/cases";
import type { ProjectCopy } from "@/lib/i18n/types";
import { subscribeScroll } from "@/lib/scroll";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Pixels per frame the ribbon drifts on its own. */
const DRIFT = 0.45;
/** Past this many pixels a press is a drag, and must not open the case. */
const DRAG_SLOP = 6;
/** Three copies: enough that a hard throw never shows the seam. */
const COPIES = 3;

/**
 * The work, on a ribbon you pull.
 *
 * The covers ride one endless strip that drifts by itself, speeds up with
 * the page's scroll, and can be grabbed and thrown with a mouse or a
 * finger; let go and it coasts to its drift again. While it moves fast the
 * cards lean into the motion, which is what makes it feel like a physical
 * strip rather than a carousel.
 *
 * Every cover is printed in the page's own ink: greyscale, multiplied onto
 * the paper, so five brands shot five different ways read as one issue.
 */
export function WorkReel() {
  const copy = useCopy();
  const reduced = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  // The covers print once, the first time the ribbon comes into view.
  const [printed, setPrinted] = useState(false);

  const projects = copy.work.projects.filter((project) => CASES[project.key]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    let x = 0;
    let velocity = 0;
    let boost = 0;
    let setWidth = track.scrollWidth / COPIES;
    let visible = false;
    let frame = 0;
    let pointer: { id: number; startX: number; lastX: number; lastT: number } | null = null;
    const cards = [...track.querySelectorAll<HTMLElement>("[data-card]")];

    const wrap = () => {
      // Keep x inside the middle copy so both directions have room.
      if (x < -setWidth * 2) x += setWidth;
      if (x > -setWidth * 0) x -= setWidth;
    };

    const render = () => {
      track.style.transform = `translate3d(${x}px,0,0)`;
      const lean = Math.max(-7, Math.min(7, velocity * 0.35));
      for (const card of cards) card.style.transform = `skewX(${-lean}deg)`;
    };

    const tick = () => {
      frame = 0;
      if (!pointer) {
        const drift = reduced ? 0 : -DRIFT - boost;
        velocity += (drift - velocity) * 0.06;
        x += velocity;
      }
      boost *= 0.9;
      wrap();
      render();
      if (visible) frame = window.requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!frame && visible) frame = window.requestAnimationFrame(tick);
    };

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      pointer = { id: event.pointerId, startX: event.clientX, lastX: event.clientX, lastT: performance.now() };
      dragged.current = false;
      viewport.style.cursor = "grabbing";
    };

    const onMove = (event: PointerEvent) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const now = performance.now();
      const dx = event.clientX - pointer.lastX;
      if (!dragged.current && Math.abs(event.clientX - pointer.startX) > DRAG_SLOP) {
        dragged.current = true;
        viewport.setPointerCapture(event.pointerId);
      }
      if (!dragged.current) return;
      x += dx;
      velocity = (dx / Math.max(now - pointer.lastT, 1)) * 16;
      pointer.lastX = event.clientX;
      pointer.lastT = now;
      wrap();
      render();
    };

    const onUp = (event: PointerEvent) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      pointer = null;
      viewport.style.cursor = "";
      if (viewport.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
      }
      wake();
    };

    // A drag that ends over a card must not also click through to it.
    const onClick = (event: MouseEvent) => {
      if (dragged.current) {
        event.preventDefault();
        event.stopPropagation();
        dragged.current = false;
      }
    };

    const seen = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        if (visible) setPrinted(true);
        wake();
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    seen.observe(viewport);

    const resize = new ResizeObserver(() => {
      setWidth = track.scrollWidth / COPIES;
    });
    resize.observe(track);

    const stop = subscribeScroll(({ velocity: scroll }) => {
      boost = Math.min(Math.abs(scroll) * 0.4, 16);
    });

    x = -setWidth;
    render();

    viewport.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    viewport.addEventListener("click", onClick, true);

    return () => {
      window.cancelAnimationFrame(frame);
      seen.disconnect();
      resize.disconnect();
      stop();
      viewport.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      viewport.removeEventListener("click", onClick, true);
    };
  }, [reduced, projects.length]);

  return (
    <Section id="work" flush className="py-band">
      <div className="sheet">
        <div className="sheet-grid items-end gap-y-8 border-t border-ink pt-8 lg:pt-10">
          <TypeText
            as="h2"
            lines={copy.work.title}
            className="poster col-span-12 text-[clamp(5rem,15vw,16rem)] text-ink lg:col-span-7"
          />
          <div className="col-span-12 lg:col-span-5">
            <PrintLines
              text={copy.work.lede}
              className="max-w-[40ch] text-[clamp(1.2rem,1.6vw,1.5rem)] leading-[1.35] text-ink"
            />
            <p className="mt-6 flex items-end gap-3 font-[family-name:var(--font-hand)] text-[clamp(1.7rem,2.2vw,2.3rem)] leading-none font-semibold text-cobalt">
              {copy.work.hint}
              <svg aria-hidden viewBox="0 0 64 28" className="h-7 w-16 overflow-visible">
                <path
                  d="M3 8 C 18 22, 38 24, 58 14 M50 8 58 14 50 21"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </p>
          </div>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="mt-12 cursor-grab touch-pan-y overflow-hidden py-4 select-none lg:mt-16"
      >
        <div ref={trackRef} className="flex w-max will-change-transform">
          {Array.from({ length: COPIES }, (_, copyIndex) =>
            projects.map((project, index) => (
              <Card
                key={`${copyIndex}-${project.key}`}
                project={project}
                index={index}
                hidden={copyIndex !== 1}
                cta={copy.work.caseCta}
                printed={printed}
              />
            )),
          )}
        </div>
      </div>
    </Section>
  );
}

function Card({
  project,
  index,
  hidden,
  cta,
  printed,
}: {
  project: ProjectCopy;
  index: number;
  /** Duplicates exist only to make the loop seamless. */
  hidden: boolean;
  cta: string;
  printed: boolean;
}) {
  const entry = CASES[project.key]!;

  // The colour lens follows the pointer inside the cover.
  const onMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  const body = (
    <>
      <span
        onPointerMove={onMove}
        className="relative block aspect-[4/5] overflow-hidden bg-paper-deep [--mx:50%] [--my:50%]"
      >
        {/* Printed in the page's ink, dot by dot, the first time it is seen. */}
        <span
          className="halftone absolute inset-0 mix-blend-multiply group-hover:scale-[1.04]"
          data-printed={printed}
          style={{
            // One declaration for both, or the scale transition would replace
            // the dot growth defined on `.halftone`.
            transition: `--dot 1700ms cubic-bezier(0.55,0,0.3,1) ${index * 170}ms, scale 900ms cubic-bezier(0.22,1,0.36,1)`,
          }}
        >
          <Image
            src={entry.cover}
            alt=""
            fill
            draggable={false}
            sizes="(max-width: 640px) 70vw, 420px"
            className="object-cover grayscale-[1] brightness-[1.55] contrast-[0.82]"
          />
        </span>
        {/* Under the pointer, the original colour shows through. */}
        <span
          aria-hidden
          className="absolute inset-0 [clip-path:circle(0px_at_var(--mx)_var(--my))] transition-[clip-path] duration-500 ease-[var(--ease-print)] group-hover:[clip-path:circle(26%_at_var(--mx)_var(--my))]"
        >
          <Image src={entry.cover} alt="" fill draggable={false} sizes="420px" className="scale-[1.04] object-cover" />
        </span>
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between bg-cobalt px-4 py-3 text-small font-semibold text-paper transition-transform duration-500 ease-[var(--ease-print)] group-hover:translate-y-0"
        >
          {cta}
          <svg viewBox="0 0 24 24" className="h-5 w-5">
            <path d="M5 19 19 5M8 5h11v11" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </span>
      </span>
      <span className="mt-4 block text-[clamp(1.35rem,1.7vw,1.7rem)] leading-tight font-bold tracking-[-0.02em] text-ink transition-colors duration-300 group-hover:text-cobalt">
        {project.name}
      </span>
      <span className="mt-1 block text-small text-ink-soft">{project.discipline}</span>
    </>
  );

  const className = "group block w-[clamp(15rem,27vw,26rem)] shrink-0 px-[clamp(0.6rem,1vw,1rem)]";

  return (
    <div data-card className="origin-bottom" aria-hidden={hidden || undefined}>
      {entry.isStatic ? (
        <a href={entry.href} className={className} tabIndex={hidden ? -1 : undefined} draggable={false}>
          {body}
        </a>
      ) : (
        <Link href={entry.href} className={className} tabIndex={hidden ? -1 : undefined} draggable={false}>
          {body}
        </Link>
      )}
    </div>
  );
}
