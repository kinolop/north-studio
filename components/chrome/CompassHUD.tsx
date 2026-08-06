"use client";

import { useEffect, useRef, useState } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { subscribeScroll } from "@/lib/scroll";
import { SECTIONS, sectionAt } from "@/lib/sections";
import { useReducedMotion } from "@/lib/useReducedMotion";

const SIZE = 64;
const C = SIZE / 2;

/** Higher settles faster. Tuned so the needle swings with weight. */
const DAMP = 3.4;

/** Shortest path around the dial: 350° → 010° must turn 20°, not 340°. */
function shortestDelta(from: number, to: number) {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

/**
 * Tick geometry, computed once and rounded.
 *
 * Rounded because trigonometry does not serialise identically on both
 * sides of a hydrate — the server rendered `x1="13.380453818634571"` and
 * the client produced `13.380453818634575`, which React reports as a
 * mismatch. Three decimals is far below a pixel at this size and makes the
 * two passes byte-identical.
 */
const TICKS = Array.from({ length: 12 }, (_, i) => {
  const cardinal = i % 3 === 0;
  const angle = (i * 30 * Math.PI) / 180;
  const outer = C - 8;
  const inner = outer - (cardinal ? 5 : 2.5);
  const round = (n: number) => Number(n.toFixed(3));
  return {
    cardinal,
    x1: round(C + Math.sin(angle) * inner),
    y1: round(C - Math.cos(angle) * inner),
    x2: round(C + Math.sin(angle) * outer),
    y2: round(C - Math.cos(angle) * outer),
  };
});

/**
 * Task H — the bearing as an actual instrument.
 *
 * The page's structural device is a compass heading per section. Printed as
 * text it was a label; here it is a dial that turns. The needle takes the
 * short way round and settles with the same expo weight as everything else,
 * so it reads as a mechanism responding rather than a number changing.
 *
 * It is aria-hidden: the heading is an ornamental restatement of where you
 * already are, and the section headings themselves carry that information
 * for assistive tech. The one thing announced is nothing — deliberately.
 */
export function CompassHUD() {
  const dialRef = useRef<SVGGElement>(null);
  const needleRef = useRef<SVGGElement>(null);
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    let rendered = -1;
    let current = 0;
    let target = 0;
    let rafId = 0;
    let last = 0;

    const apply = (degrees: number) => {
      // The dial counter-rotates and the needle rotates: the same trick a
      // real compass uses, and it doubles the sense of movement for free.
      dialRef.current?.setAttribute(
        "transform",
        `rotate(${(-degrees).toFixed(2)} ${C} ${C})`,
      );
      needleRef.current?.setAttribute(
        "transform",
        `rotate(${degrees.toFixed(2)} ${C} ${C})`,
      );
    };

    // The needle only turns between sections, which is a handful of times
    // in a whole visit. A loop that ran regardless was burning a frame's
    // worth of work to discover it had nothing to do.
    const frame = (now: number) => {
      const dt = last === 0 ? 1 / 60 : Math.min((now - last) / 1000, 0.1);
      last = now;

      const delta = shortestDelta(current, target);
      if (Math.abs(delta) < 0.05) {
        current = target;
        apply(current);
        rafId = 0;
        return;
      }

      current += delta * (1 - Math.exp(-DAMP * dt));
      apply(current);
      rafId = window.requestAnimationFrame(frame);
    };

    const spin = () => {
      if (rafId !== 0) return;
      last = 0;
      rafId = window.requestAnimationFrame(frame);
    };

    const unsubscribe = subscribeScroll(({ index: next }) => {
      if (next === rendered) return;
      rendered = next;
      setIndex(next);

      target = sectionAt(next).degrees;
      if (reduced) {
        current = target;
        apply(current);
      } else {
        spin();
      }
    });

    return () => {
      unsubscribe();
      window.cancelAnimationFrame(rafId);
    };
  }, [reduced]);

  const copy = useCopy();
  const section = sectionAt(index);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-5 left-[max(1rem,var(--spacing-gutter))] z-40 hidden items-center gap-4 md:flex"
    >
      {/* The instrument is fixed over a scrolling page, so on some sections
          body text runs directly underneath it. A soft radial scrim sinks
          whatever is behind without drawing a box around the HUD. It is a
          static paint on a small layer — the earlier backdrop-blur version
          of this idea is exactly what the performance pass removed. */}
      <div
        className="absolute -inset-x-8 -inset-y-10 -z-10 bg-[radial-gradient(60%_60%_at_28%_50%,var(--color-void)_38%,transparent_78%)]"
      />
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="shrink-0 overflow-visible"
      >
        {/* Fixed housing. */}
        <circle cx={C} cy={C} r={C - 1} className="fill-void/60 stroke-hairline" strokeWidth="1" />
        <circle cx={C} cy={C} r={C - 7} className="fill-none stroke-hairline" strokeWidth="0.5" />

        {/* Rotating dial: ticks every 30°, longer at the cardinals. */}
        <g ref={dialRef}>
          {TICKS.map((tick, i) => (
            <line
              key={i}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              className={tick.cardinal ? "stroke-ash" : "stroke-hairline"}
              strokeWidth={tick.cardinal ? 1 : 0.75}
              strokeLinecap="round"
            />
          ))}
          {/* North mark on the dial itself. */}
          <circle cx={C} cy={C - (C - 4)} r="1.4" className="fill-signal" />
        </g>

        {/* Needle, counter-rotating against the dial. */}
        <g ref={needleRef}>
          <path
            d={`M${C} ${C - (C - 13)} L${C + 3.4} ${C + 5} L${C} ${C + 1.5} L${C - 3.4} ${C + 5} Z`}
            className="fill-signal-lift"
          />
          <path
            d={`M${C} ${C + (C - 17)} L${C + 2.4} ${C - 3} L${C} ${C - 0.5} L${C - 2.4} ${C - 3} Z`}
            className="fill-slate"
          />
        </g>

        <circle cx={C} cy={C} r="1.6" className="fill-bone" />
      </svg>

      <div className="leading-none">
        <p className="label-mono text-signal-lift">{section.bearing}</p>
        <p className="label-mono mt-1.5 text-slate">{copy.sections[section.id]}</p>
      </div>
    </div>
  );
}

/** Exported for the preloader's calibration sweep. */
export const COMPASS_TERMINUS = SECTIONS[0].degrees;
