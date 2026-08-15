"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

import { Reveal } from "@/components/ui/Reveal";
import type { ProjectCopy } from "@/lib/i18n/types";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { ProjectPlate } from "./ProjectPlate";

/** Maximum lean, in degrees. Past about six this stops reading as depth. */
const TILT = 5;

interface WorkCardProps {
  project: ProjectCopy;
  /**
   * "lead" runs the plate and the copy side by side across the full width;
   * "stacked" puts the copy under the plate. The lead piece gets the
   * different shape so the grid says "start here" rather than "we have
   * exactly three".
   */
  variant?: "lead" | "stacked";
  /**
   * Flips a lead card so the plate sits on the right. Two full-width cases
   * stacked identically read as a list; alternating them reads as a spread.
   */
  mirrored?: boolean;
  delay?: number;
  className?: string;
  /** When set the whole card becomes a link to the case page. */
  href?: string;
  /** Shown as the card's action when it links somewhere. */
  cta?: string;
}

export function WorkCard({
  project,
  variant = "stacked",
  mirrored = false,
  delay = 0,
  className = "",
  href,
  cta,
}: WorkCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 140, damping: 22, mass: 0.6 } as const;
  const rotateY = useSpring(useTransform(px, [0, 1], [-TILT, TILT]), spring);
  const rotateX = useSpring(useTransform(py, [0, 1], [TILT, -TILT]), spring);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
    // Feeds the metallic edge light below.
    card.style.setProperty("--px", `${(event.clientX - rect.left).toFixed(0)}px`);
    card.style.setProperty("--py", `${(event.clientY - rect.top).toFixed(0)}px`);
  };

  const onPointerLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  const lead = variant === "lead";

  const copy = (
    <div className={lead ? "flex flex-col justify-center p-9 lg:p-12" : "flex flex-1 flex-col p-7 lg:p-8"}>
      <div className="flex items-baseline justify-between gap-6">
        <h3
          className={`font-display font-medium text-bone ${lead ? "text-display" : "text-title"}`}
        >
          {project.name}
        </h3>
        <p className="label-mono shrink-0">{project.year}</p>
      </div>

      <p className="label-mono mt-4 text-signal-lift">{project.discipline}</p>

      <p className={`mt-auto pt-6 max-w-[46ch] text-ash ${lead ? "text-lead" : "text-body"}`}>
        {project.summary}
      </p>

      {href && cta && (
        <p className="mt-auto flex items-center gap-3 pt-8 text-meta text-bone">
          {cta}
          <svg aria-hidden viewBox="0 0 24 10" className="h-[10px] w-6 text-signal-lift">
            <path
              d="M0 5h21M17 1l4 4-4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              className="transition-transform duration-[var(--duration-state)] ease-[var(--ease-north)] group-hover:translate-x-1"
            />
          </svg>
        </p>
      )}
    </div>
  );

  return (
    <Reveal delay={delay} className={className}>
      <motion.div
        ref={cardRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1400 }}
        className="group relative h-full"
      >
        {/* Metallic edge light. A 1px ring lit from wherever the pointer is —
            two stacked layers rather than a mask-composite border, because
            this renders identically in every engine. */}
        <div
          className="relative h-full rounded-[var(--radius-plate)] p-px"
          style={{
            background:
              "radial-gradient(340px circle at var(--px, -20%) var(--py, -20%), rgb(167 155 255 / 0.5), var(--color-hairline) 62%)",
          }}
        >
          <Shell href={href} name={project.name}>
          <article
            className={`relative h-full overflow-hidden rounded-[3px] bg-abyss ${lead ? "grid lg:grid-cols-12" : "flex flex-col"}`}
          >
            <div
              className={`relative overflow-hidden ${lead ? "aspect-[16/10] lg:col-span-7 lg:aspect-auto" : "aspect-[16/10]"} ${mirrored ? "lg:order-2" : ""}`}
            >
              <ProjectPlate project={project} />
              {/* Graded scrim so type never fights the plate — falling away
                  from whichever side the copy is on. */}
              <div
                className={`absolute inset-0 ${
                  lead
                    ? mirrored
                      ? "bg-[linear-gradient(to_left,transparent_55%,var(--color-abyss))]"
                      : "bg-[linear-gradient(to_right,transparent_55%,var(--color-abyss))]"
                    : "top-auto h-2/5 bg-[linear-gradient(to_top,var(--color-abyss),transparent)]"
                }`}
              />
            </div>

            {lead ? (
              <div className={`lg:col-span-5 ${mirrored ? "lg:order-1" : ""}`}>
                {copy}
              </div>
            ) : (
              copy
            )}
          </article>
          </Shell>
        </div>
      </motion.div>
    </Reveal>
  );
}

/**
 * A case with a page behind it becomes one big link; a placeholder stays
 * inert. Wrapping rather than adding an anchor inside keeps the whole plate
 * clickable, which is what a card this size implies.
 */
function Shell({
  href,
  name,
  children,
}: {
  href?: string;
  name: string;
  children: React.ReactNode;
}) {
  if (!href) return <>{children}</>;
  return (
    <Link href={href} aria-label={name} className="block h-full">
      {children}
    </Link>
  );
}
