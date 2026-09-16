"use client";

import { useRef } from "react";

import { useOnScreen } from "@/lib/useOnScreen";

export type WireGroup = "sites" | "agents" | "automation";

interface Geometry {
  width: number;
  height: number;
  core: { x: number; y: number; w: number; h: number; size: number };
  label: number;
  inputs: { path: string; lx: number; ly: number; anchor: "start" | "end"; nx: number; ny: number }[];
  outputs: { path: string; lx: number; ly: number; anchor: "start" | "end"; nx: number; ny: number }[];
}

function spread(count: number, from: number, to: number) {
  if (count === 1) return [(from + to) / 2];
  return Array.from({ length: count }, (_, i) => from + ((to - from) * i) / (count - 1));
}

/** Wide sheet: sources on the left, destinations on the right. */
function horizontal(inputs: number, outputs: number): Geometry {
  const core = { x: 505, y: 178, w: 190, h: 84, size: 44 };
  const cy = core.y + core.h / 2;
  return {
    width: 1200,
    height: 440,
    core,
    label: 17,
    inputs: spread(inputs, 48, 392).map((y) => {
      const ey = cy + (y - cy) * 0.2;
      return {
        path: `M190 ${y} C 360 ${y} 380 ${ey} ${core.x} ${ey}`,
        lx: 172,
        ly: y,
        anchor: "end",
        nx: 190,
        ny: y,
      };
    }),
    outputs: spread(outputs, 84, 356).map((y) => {
      const sy = cy + (y - cy) * 0.2;
      const right = core.x + core.w;
      return {
        path: `M${right} ${sy} C 820 ${sy} 840 ${y} 1010 ${y}`,
        lx: 1028,
        ly: y,
        anchor: "start",
        nx: 1010,
        ny: y,
      };
    }),
  };
}

/** Phone: sources stacked above, destinations below. */
function vertical(inputs: number, outputs: number): Geometry {
  const core = { x: 110, y: 282, w: 140, h: 62, size: 34 };
  const top = core.y;
  const bottom = core.y + core.h;
  return {
    width: 360,
    height: 630,
    core,
    label: 14,
    inputs: spread(inputs, 34, 210).map((y, i, all) => {
      const ex = 150 + (60 * i) / Math.max(all.length - 1, 1);
      return {
        path: `M120 ${y} C 170 ${y} ${ex} ${y + 40} ${ex} ${top}`,
        lx: 104,
        ly: y,
        anchor: "end",
        nx: 120,
        ny: y,
      };
    }),
    outputs: spread(outputs, 426, 596).map((y, i, all) => {
      const sx = 150 + (60 * i) / Math.max(all.length - 1, 1);
      return {
        path: `M${sx} ${bottom} C ${sx} ${y - 40} 190 ${y} 238 ${y}`,
        lx: 254,
        ly: y,
        anchor: "start",
        nx: 238,
        ny: y,
      };
    }),
  };
}

const INPUT_GROUPS: readonly WireGroup[] = ["sites", "sites", "agents", "agents", "agents"];
const OUTPUT_GROUPS: readonly WireGroup[] = ["agents", "automation", "automation", "automation"];

/**
 * The system, drawn as wiring.
 *
 * Enquiries run in from every channel, through the studio's one core, and
 * out to wherever they are needed. Pulses travel in along the sources and
 * out along the destinations, so the page shows the promise of the section
 * rather than stating it: nothing arrives that does not go somewhere.
 *
 * Hovering a service below lights only that service's wires. The animation
 * is CSS on the compositor's schedule and holds still off screen.
 */
export function WireDiagram({
  inputs,
  outputs,
  core,
  label,
  focus,
}: {
  inputs: readonly string[];
  outputs: readonly string[];
  core: string;
  label: string;
  focus: WireGroup | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(ref, "0px");

  return (
    <div ref={ref} role="img" aria-label={label} data-wires={onScreen ? "run" : "held"}>
      <Sheet geometry={horizontal(inputs.length, outputs.length)} className="hidden md:block" {...{ inputs, outputs, core, focus }} />
      <Sheet geometry={vertical(inputs.length, outputs.length)} className="mx-auto max-w-[26rem] md:hidden" {...{ inputs, outputs, core, focus }} />
    </div>
  );
}

function Sheet({
  geometry,
  className,
  inputs,
  outputs,
  core,
  focus,
}: {
  geometry: Geometry;
  className: string;
  inputs: readonly string[];
  outputs: readonly string[];
  core: string;
  focus: WireGroup | null;
}) {
  const dim = (group: WireGroup) => (focus && focus !== group ? 0.18 : 1);
  const wire = (
    key: string,
    d: string,
    group: WireGroup,
    delay: number,
  ) => (
    <g
      key={key}
      style={{ opacity: dim(group), transition: "opacity 420ms var(--ease-print)" }}
    >
      <path d={d} fill="none" stroke="var(--color-ink)" strokeOpacity="0.28" strokeWidth="1.2" />
      <path
        d={d}
        data-wire
        pathLength={100}
        fill="none"
        stroke="var(--color-cobalt)"
        strokeWidth="3"
        strokeLinecap="square"
        strokeDasharray="9 191"
        strokeDashoffset="10"
        className="motion-safe:animate-[wireRun_2800ms_cubic-bezier(0.45,0,0.25,1)_infinite]"
        style={{ animationDelay: `${delay}ms` }}
      />
    </g>
  );

  const { core: c } = geometry;

  return (
    <svg
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      className={`w-full ${className}`}
      aria-hidden
    >
      {geometry.inputs.map((item, i) =>
        wire(`in-${i}`, item.path, INPUT_GROUPS[i] ?? "agents", i * 260),
      )}
      {geometry.outputs.map((item, i) =>
        wire(`out-${i}`, item.path, OUTPUT_GROUPS[i] ?? "automation", 1500 + i * 220),
      )}

      {[...geometry.inputs.map((g, i) => ({ g, text: inputs[i], group: INPUT_GROUPS[i] ?? "agents" })),
        ...geometry.outputs.map((g, i) => ({ g, text: outputs[i], group: OUTPUT_GROUPS[i] ?? "automation" }))].map(
        ({ g, text, group }, i) => (
          <g key={`label-${i}`} style={{ opacity: dim(group), transition: "opacity 420ms var(--ease-print)" }}>
            <rect x={g.nx - 3.5} y={g.ny - 3.5} width="7" height="7" fill="var(--color-ink)" />
            <text
              x={g.lx}
              y={g.ly}
              dy="0.36em"
              textAnchor={g.anchor}
              fill="var(--color-ink)"
              style={{ fontFamily: "var(--font-text)", fontSize: geometry.label, fontWeight: 600 }}
            >
              {text}
            </text>
          </g>
        ),
      )}

      <rect
        x={c.x}
        y={c.y}
        width={c.w}
        height={c.h}
        fill="var(--color-ink)"
        data-wire
        className="motion-safe:animate-[coreBeat_2800ms_linear_infinite]"
        style={{ animationDelay: "900ms" }}
      />
      <text
        x={c.x + c.w / 2}
        y={c.y + c.h / 2}
        dy="0.34em"
        textAnchor="middle"
        fill="var(--color-paper)"
        style={{
          fontFamily: "var(--font-poster)",
          fontSize: c.size,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.02em",
        }}
      >
        {core}
      </text>
    </svg>
  );
}
