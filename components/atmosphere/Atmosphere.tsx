"use client";

import dynamic from "next/dynamic";

import { CursorLight } from "./CursorLight";
import { Grain } from "./Grain";

/**
 * three is ~150kB gzipped and irrelevant to first paint, so the fog is
 * loaded after hydration. The CSS gradient below it is the first frame and
 * the permanent fallback where WebGL is unavailable.
 */
const FogCanvas = dynamic(
  () => import("./FogCanvas").then((m) => m.FogCanvas),
  { ssr: false },
);

/**
 * The lit room every section sits inside.
 *
 * Order matters top to bottom: base gradient, volumetric fog, cursor light,
 * grain. The whole stack is fixed, inert to pointer events and pinned below
 * content — sections layer on top of it rather than repeating backgrounds.
 */
export function Atmosphere() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,#11141c_0%,#07080b_58%)]" />
      <FogCanvas />
      <CursorLight />
      <Grain />
    </div>
  );
}
