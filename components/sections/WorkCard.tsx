"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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
  delay?: number;
  className?: string;
}

export function WorkCard({
  project,
  variant = "stacked",
  delay = 0,
  className = "",
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

      {/* The tier line that used to sit here named a priced package. With
          the tiers gone it named nothing, and all three cases are sites
          anyway — repeating the word three times was noise. */}
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
          <article
            className={`relative h-full overflow-hidden rounded-[3px] bg-abyss ${lead ? "grid lg:grid-cols-12" : "flex flex-col"}`}
          >
            <div
              className={`relative overflow-hidden ${lead ? "aspect-[16/10] lg:col-span-7 lg:aspect-auto" : "aspect-[16/10]"}`}
            >
              <ProjectPlate project={project} />
              {/* Graded scrim so type never fights the plate. */}
              <div
                className={`absolute inset-0 ${lead ? "bg-[linear-gradient(to_right,transparent_55%,var(--color-abyss))]" : "top-auto h-2/5 bg-[linear-gradient(to_top,var(--color-abyss),transparent)]"}`}
              />
            </div>

            {lead ? <div className="lg:col-span-5">{copy}</div> : copy}
          </article>
        </div>
      </motion.div>
    </Reveal>
  );
}
