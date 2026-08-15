"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

import { Reveal } from "@/components/ui/Reveal";
import type { ProjectCopy } from "@/lib/i18n/types";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Maximum lean, in degrees. Past about six this stops reading as depth. */
const TILT = 5;

interface WorkCardProps {
  project: ProjectCopy;
  /**
   * "lead" runs the name and the prose side by side across the full width;
   * "stacked" is a single column. The lead piece gets the different shape so
   * the grid says "start here" rather than "we have exactly three".
   */
  variant?: "lead" | "stacked";
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

  const action = href && cta && (
    <p className="flex items-center gap-3 text-meta text-bone">
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
  );

  /**
   * With the plate gone the lead card would otherwise be one tall column of
   * text across the full width, so it splits: the name holds the left, the
   * prose and the action the right. The stacked cards stay a single column.
   */
  const copy = lead ? (
    <div className="grid gap-8 p-9 lg:grid-cols-12 lg:items-end lg:gap-10 lg:p-12">
      <div className="lg:col-span-6">
        <div className="flex items-baseline justify-between gap-6">
          <h3 className="text-display font-display font-medium text-bone">
            {project.name}
          </h3>
          <p className="label-mono shrink-0 lg:hidden">{project.year}</p>
        </div>
        <p className="label-mono mt-5 text-signal-lift">{project.discipline}</p>
      </div>

      <div className="lg:col-span-5 lg:col-start-8">
        <p className="label-mono hidden lg:mb-6 lg:block">{project.year}</p>
        <p className="max-w-[46ch] text-lead text-ash">{project.summary}</p>
        {action && <div className="mt-10">{action}</div>}
      </div>
    </div>
  ) : (
    <div className="flex flex-1 flex-col p-7 lg:p-8">
      <div className="flex items-baseline justify-between gap-6">
        <h3 className="text-title font-display font-medium text-bone">
          {project.name}
        </h3>
        <p className="label-mono shrink-0">{project.year}</p>
      </div>

      <p className="label-mono mt-4 text-signal-lift">{project.discipline}</p>

      <p className="mt-auto max-w-[46ch] pt-6 text-body text-ash">
        {project.summary}
      </p>

      {action && <div className="mt-auto pt-8">{action}</div>}
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
            {/* No plate. The card is a flat dark panel with a hairline and
                the pointer's light on its edge — the work is named, not
                illustrated, and nothing here pretends to be a screenshot. */}
            <article className="relative h-full overflow-hidden rounded-[3px] bg-abyss">
              {copy}
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
