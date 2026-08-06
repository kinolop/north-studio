"use client";

import { motion } from "framer-motion";
import { createElement, useRef } from "react";

import { DURATION, EASE } from "@/lib/motion";
import { useReveal } from "@/lib/useReveal";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p";

interface SplitLinesProps {
  /** Pre-split lines. The break is an editorial decision, not an accident of width. */
  lines: readonly string[];
  as?: HeadingTag;
  className?: string;
  /** Delay before the first line, in seconds. */
  delay?: number;
  stagger?: number;
  /** Above the fold, animate on mount rather than waiting to be scrolled to. */
  trigger?: "mount" | "inView";
}

/**
 * Mask-based line reveal, hand-rolled.
 *
 * GSAP's SplitText is a paid Club plugin, so this does the one thing we
 * actually need without the licence: each line sits inside its own overflow
 * window and is lifted out. It reads as printing rather than fading, and
 * because lines are authored rather than measured, the text is present and
 * selectable in the DOM for crawlers and screen readers at all times.
 */
export function SplitLines({
  lines,
  as = "h2",
  className,
  delay = 0,
  stagger = 0.075,
  trigger = "inView",
}: SplitLinesProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const phase = useReveal(ref, { mode: trigger });

  return createElement(
    as,
    { className, ref },
    lines.map((line, index) => (
      <span key={line} className="line-mask">
        <motion.span
          className="block"
          initial={false}
          animate={{ y: phase === "armed" ? "115%" : "0%" }}
          transition={
            phase === "in"
              ? {
                  duration: DURATION.reveal,
                  ease: EASE.north,
                  delay: delay + index * stagger,
                }
              : { duration: 0 }
          }
        >
          {line}
        </motion.span>
      </span>
    )),
  );
}
