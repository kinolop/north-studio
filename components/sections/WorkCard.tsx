"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
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
  /**
   * Marks a case that is not a route in this app. Those are served as whole
   * static documents out of `public`, so the router has no payload to fetch
   * for them and has to hand the address to the browser instead.
   */
  external?: boolean;
  /** Shown as the card's action when it links somewhere. */
  cta?: string;
  /**
   * Path under /public. Absent means the card keeps its older, wordless
   * shape rather than reserving a band for a picture that never arrives.
   */
  cover?: string;
}

export function WorkCard({
  project,
  variant = "stacked",
  delay = 0,
  className = "",
  href,
  external = false,
  cta,
  cover,
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
   * The cover.
   *
   * These come from five different brands and were never drawn as a set —
   * two are renders, two are photographs a client shot, one is a bright
   * clinical plate. So the treatment is what holds them together rather
   * than the artwork: one scrim into the card's own ground, one hairline,
   * and a rest-state dampening that clears under the pointer. The
   * dampening earns its place twice — it stops a light plate from glaring
   * beside a dark one, and it gives every card the same "wakes up when you
   * reach for it" beat.
   *
   * The lead runs wider than its source ratio. These are centre-weighted
   * renders with nothing living in the top and bottom eighths, so the crop
   * costs nothing and buys the flagship a cinematic band.
   */
  const media = cover && (
    <div
      className="relative shrink-0 overflow-hidden border-b border-hairline bg-void"
      style={{ aspectRatio: lead ? "16 / 7" : "8 / 5" }}
    >
      <Image
        src={cover}
        alt=""
        fill
        sizes={
          lead
            ? "(max-width: 640px) 92vw, (max-width: 1440px) 94vw, 1380px"
            : "(max-width: 640px) 92vw, (max-width: 1440px) 46vw, 680px"
        }
        className="object-cover object-center brightness-[0.86] transition-[transform,filter] duration-[620ms] ease-[var(--ease-north)] group-hover:brightness-100 motion-safe:group-hover:scale-[1.045]"
      />

      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-abyss),rgb(10_12_16/0.34)_26%,transparent_62%)]"
      />
    </div>
  );

  /**
   * The lead card would otherwise be one tall column of text across the
   * full width, so it splits: the name holds the left, the prose and the
   * action the right. The stacked cards stay a single column.
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
          <Shell href={href} external={external} name={project.name}>
            {/* Cover on top, words beneath. The panel underneath is still a
                flat dark ground with the pointer's light on its edge — the
                picture is seated into that, not laid on top of it. */}
            <article className="relative flex h-full flex-col overflow-hidden rounded-[3px] bg-abyss">
              {media}
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
 *
 * `external` cases get a bare anchor rather than a `<Link>`. They are static
 * documents with their own `<head>`, their own stylesheet and their own
 * fonts, so there is nothing for the router to prefetch and nothing it could
 * usefully render — a full page load is the correct navigation, and asking
 * for it directly is cheaper than letting the router discover it.
 */
function Shell({
  href,
  external,
  name,
  children,
}: {
  href?: string;
  external?: boolean;
  name: string;
  children: React.ReactNode;
}) {
  if (!href) return <>{children}</>;

  if (external) {
    return (
      <a href={href} aria-label={name} className="block h-full">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} aria-label={name} className="block h-full">
      {children}
    </Link>
  );
}
