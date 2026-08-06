"use client";

import { useEffect, useRef, useState } from "react";

import { subscribePointer } from "@/lib/pointer";

/** Lens size. Everything the light does happens inside this box. */
const LENS = 620;
/** Must match the dot pitch below — the grid is world-locked modulo this. */
const GRID = 34;

/**
 * Mechanic 2, the 2D half — the cursor lights the page itself, not just the
 * 3D scene.
 *
 * The first version of this was the single most expensive thing on the site:
 * two full-viewport fixed layers, one carrying a `mask-image` whose centre
 * was a CSS variable updated every frame. Moving a mask means regenerating
 * it and repainting everything under it — 1.3 million pixels, sixty times a
 * second, for a soft glow. Profiling put it at roughly eleven frames.
 *
 * So the light is now a small element that MOVES rather than a large one
 * that is re-masked. The transform stays on the compositor and costs
 * essentially nothing. The only paint left is the dot grid's background
 * offset, confined to the lens, and because the grid is periodic, offsetting
 * it by (-x mod 34) makes it look perfectly locked to the page even though
 * the element it lives in is sliding around.
 */
export function CursorLight() {
  const lensRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const lens = lensRef.current;
    const grid = gridRef.current;
    if (!lens || !grid) return;

    let frame = 0;
    const unsubscribe = subscribePointer(({ x, y }) => {
      // Compositor-only: no layout, no paint.
      lens.style.transform = `translate3d(${(x - LENS / 2).toFixed(1)}px, ${(y - LENS / 2).toFixed(1)}px, 0)`;
      // Paint, but confined to the lens and only because the grid has to
      // stay put while its container moves.
      const ox = (((-x % GRID) + GRID) % GRID).toFixed(1);
      const oy = (((-y % GRID) + GRID) % GRID).toFixed(1);
      grid.style.backgroundPosition = `${ox}px ${oy}px`;
    });

    setReady(true);
    return () => {
      unsubscribe();
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={lensRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 transition-opacity duration-[1400ms] ease-[var(--ease-north)]"
      style={{
        width: LENS,
        height: LENS,
        opacity: ready ? 1 : 0,
        willChange: "transform",
      }}
    >
      {/* The light. Barely there — it should register as a change in the
          room, not as a spotlight following the mouse. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgb(120 108 255 / 0.10) 0%, rgb(120 108 255 / 0.035) 38%, transparent 68%)",
        }}
      />

      {/* Surface revealed by the light. The mask is static — it moves with
          the element rather than being recomputed against it. */}
      <div
        ref={gridRef}
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgb(167 155 255 / 0.55) 0.8px, transparent 0.9px)",
          backgroundSize: `${GRID}px ${GRID}px`,
          maskImage:
            "radial-gradient(circle at center, black 0%, rgb(0 0 0 / 0.35) 34%, transparent 52%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 0%, rgb(0 0 0 / 0.35) 34%, transparent 52%)",
        }}
      />
    </div>
  );
}
