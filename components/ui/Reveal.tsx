"use client";

import { motion } from "framer-motion";
import { useRef, type ReactNode } from "react";

import { DURATION, EASE } from "@/lib/motion";
import { useReveal } from "@/lib/useReveal";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Travel distance in px. Keep it small — this is a settle, not a slide. */
  distance?: number;
}

/**
 * The site's one entrance primitive. Transform and opacity only, so it stays
 * on the compositor and never triggers layout. Everything that enters on
 * scroll goes through here, which is what makes the page feel authored
 * rather than assembled from separate effects.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  distance = 26,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const phase = useReveal(ref);

  return (
    <motion.div
      ref={ref}
      data-reveal
      className={className}
      // `initial={false}` starts at whatever `animate` currently resolves to,
      // which for the idle phase is the visible, final state.
      initial={false}
      animate={phase === "armed" ? { opacity: 0, y: distance } : { opacity: 1, y: 0 }}
      transition={
        phase === "in"
          ? { duration: DURATION.reveal, ease: EASE.north, delay }
          : { duration: 0 }
      }
    >
      {children}
    </motion.div>
  );
}
