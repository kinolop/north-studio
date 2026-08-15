"use client";

import { useEffect, useRef } from "react";

import { subscribeScroll } from "@/lib/scroll";
import { useActiveSections } from "@/lib/useActiveSections";

const RAIL_TOP = 14;
const RAIL_HEIGHT = 268;
const RAIL_X = 15;
const COLUMN_W = 7;

/**
 * Mechanic 3 — the scroll indicator as mercury.
 *
 * Structure, because the ordering is the whole trick: a goo filter (blur,
 * then a hard alpha ramp) is applied to plain white shapes inside an SVG
 * mask; the visible artwork is a single chrome-gradient rectangle showing
 * through that mask. Filtering the artwork directly would smear the
 * gradient into mud — masking keeps the metal crisp while the *silhouette*
 * behaves like liquid.
 *
 * The droplet trails the column by an amount proportional to scroll
 * velocity. Scroll hard and it tears away, the goo stretches a neck between
 * them, and it snaps back when you stop. Two attribute writes a frame.
 *
 * The bearing readout that used to sit beside this now lives in the compass
 * HUD, which reads the same signal. Two instruments showing one number was
 * one instrument too many.
 */
export function ScrollRail() {
  const sections = useActiveSections();
  const columnRef = useRef<SVGRectElement>(null);
  const headRef = useRef<SVGCircleElement>(null);
  const dropletRef = useRef<SVGEllipseElement>(null);
  const sheenRef = useRef<SVGLinearGradientElement>(null);
  const mobileBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribeScroll(({ progress, velocity }) => {
      const columnEnd = RAIL_TOP + progress * RAIL_HEIGHT;
      const column = columnRef.current;
      const head = headRef.current;
      const droplet = dropletRef.current;
      const sheen = sheenRef.current;
      const mobileBar = mobileBarRef.current;

      if (column) {
        column.setAttribute("height", String(Math.max(columnEnd - RAIL_TOP, 0.1)));
      }
      if (head) head.setAttribute("cy", String(columnEnd));

      if (droplet) {
        // Lag opposes travel: scrolling down leaves the droplet above.
        const lag = Math.max(Math.min(-velocity * 0.55, 26), -26);
        const speed = Math.min(Math.abs(velocity) / 34, 1);
        droplet.setAttribute("cy", String(columnEnd + lag));
        // Mercury thins as it stretches and beads up when it settles.
        droplet.setAttribute("rx", String(COLUMN_W / 2 - speed * 1.3));
        droplet.setAttribute("ry", String(COLUMN_W / 2 + speed * 7));
      }

      // The sheen travels against the scroll, so the metal reads as being
      // lit from a fixed room while the liquid moves through it.
      if (sheen) {
        sheen.setAttribute(
          "gradientTransform",
          `translate(0 ${(-progress * RAIL_HEIGHT * 0.55).toFixed(2)})`,
        );
      }

      if (mobileBar) mobileBar.style.transform = `scaleX(${progress.toFixed(4)})`;
    });
  }, []);

  return (
    <>
      {/* Mobile: the rail would eat scarce width, so progress collapses to a
          hairline under the header. */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-40 h-px origin-left bg-signal/70 md:hidden"
        ref={mobileBarRef}
        style={{ transform: "scaleX(0)" }}
      />

      <div
        aria-hidden
        className="fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 md:block lg:right-6"
      >
        <svg
          width="30"
          height={RAIL_TOP * 2 + RAIL_HEIGHT}
          viewBox={`0 0 30 ${RAIL_TOP * 2 + RAIL_HEIGHT}`}
          className="overflow-visible"
        >
          <defs>
            {/* Blur, then ramp alpha hard: adjacent shapes fuse and separate
                like a liquid instead of overlapping like two sprites. */}
            <filter id="rail-goo" x="-80%" y="-20%" width="260%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.6" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -9"
              />
              {/* A turbulence + displacement pass used to sit here to rough
                  up the silhouette. It re-evaluated fractal noise over the
                  filter region on every frame of every scroll, which is a
                  lot of GPU for an irregularity nobody reported noticing.
                  The goo alone still reads as mercury. */}
            </filter>

            <linearGradient
              id="rail-sheen"
              ref={sheenRef}
              x1="0"
              y1="0"
              x2="0.35"
              y2={RAIL_TOP * 2 + RAIL_HEIGHT}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="16%" stopColor="#8e95a4" />
              <stop offset="31%" stopColor="#f2f4f8" />
              <stop offset="47%" stopColor="#5d6472" />
              <stop offset="62%" stopColor="#e6e9f0" />
              <stop offset="79%" stopColor="#7b8290" />
              <stop offset="100%" stopColor="#c9cfda" />
            </linearGradient>

            <mask id="rail-mercury">
              <g filter="url(#rail-goo)" fill="#ffffff">
                <rect
                  ref={columnRef}
                  x={RAIL_X - COLUMN_W / 2}
                  y={RAIL_TOP}
                  width={COLUMN_W}
                  height="0.1"
                  rx={COLUMN_W / 2}
                />
                <circle ref={headRef} cx={RAIL_X} cy={RAIL_TOP} r={COLUMN_W / 2 + 1.2} />
                <ellipse
                  ref={dropletRef}
                  cx={RAIL_X}
                  cy={RAIL_TOP}
                  rx={COLUMN_W / 2}
                  ry={COLUMN_W / 2}
                />
              </g>
            </mask>
          </defs>

          {/* Empty track. */}
          <rect
            x={RAIL_X - 0.5}
            y={RAIL_TOP}
            width="1"
            height={RAIL_HEIGHT}
            fill="currentColor"
            className="text-hairline"
          />

          {/* Section ticks — decorative, so no keyboard target to strand. */}
          {sections.map((section, index) => (
            <rect
              key={section.id}
              x={RAIL_X + 5}
              y={RAIL_TOP + (index / Math.max(sections.length - 1, 1)) * RAIL_HEIGHT - 0.5}
              width="4"
              height="1"
              fill="currentColor"
              className="text-hairline"
            />
          ))}

          {/* The metal itself, revealed through the liquid silhouette. */}
          <rect
            x="0"
            y="0"
            width="30"
            height={RAIL_TOP * 2 + RAIL_HEIGHT}
            fill="url(#rail-sheen)"
            mask="url(#rail-mercury)"
          />
        </svg>
      </div>
    </>
  );
}
