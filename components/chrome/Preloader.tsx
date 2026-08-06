"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { bayerThreshold } from "@/lib/dither";
import { GLYPH_ASPECT, isInsideGlyph } from "@/components/scene/nGlyph";
import { useReducedMotion } from "@/lib/useReducedMotion";

const SESSION_KEY = "north-intro-seen";
/** Assembly, then hold, then hand off. Deliberately under two seconds. */
const ASSEMBLE_MS = 1250;
const HOLD_MS = 260;
const COLS = 46;

interface Point {
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  /** 0..1 — when this point starts moving. Comes from the Bayer matrix. */
  delay: number;
  shade: number;
}

function buildPoints(): Point[] {
  const rows = Math.round(COLS / GLYPH_ASPECT);
  const points: Point[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const u = (col + 0.5) / COLS;
      const v = (row + 0.5) / rows;
      if (!isInsideGlyph(u, v)) continue;

      // The ordered-dither threshold does double duty: it staggers arrival
      // so the letter resolves in the matrix's own pattern rather than
      // sweeping, and it sets each point's brightness.
      const threshold = bayerThreshold(col, row);
      const angle = Math.random() * Math.PI * 2;
      const distance = 0.35 + Math.random() * 0.75;

      points.push({
        tx: u,
        ty: 1 - v,
        sx: u + Math.cos(angle) * distance,
        sy: 1 - v + Math.sin(angle) * distance,
        delay: threshold * 0.45,
        shade: 0.45 + threshold * 0.55,
      });
    }
  }
  return points;
}

/** Expo-out: the same weight as every other motion on the site. */
const ease = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function Preloader() {
  const copy = useCopy();
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"pending" | "running" | "done">("pending");
  const [progress, setProgress] = useState(0);

  // Runs before paint, so a repeat view within the session never flashes
  // the intro. The server always renders it, which is what stops the hero
  // appearing for one frame before the intro covers it.
  useLayoutEffect(() => {
    const seen = window.sessionStorage.getItem(SESSION_KEY);
    if (seen || reduced) {
      setPhase("done");
      return;
    }
    setPhase("running");
  }, [reduced]);

  useEffect(() => {
    if (phase !== "running") return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      setPhase("done");
      return;
    }

    const points = buildPoints();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let rafId = 0;
    let start = 0;
    let finished = false;

    const resize = () => {
      const size = Math.min(window.innerWidth * 0.42, window.innerHeight * 0.4, 360);
      canvas.width = Math.round(size * GLYPH_ASPECT * dpr);
      canvas.height = Math.round(size * dpr);
      canvas.style.width = `${size * GLYPH_ASPECT}px`;
      canvas.style.height = `${size}px`;
    };
    resize();
    window.addEventListener("resize", resize);

    const finish = () => {
      if (finished) return;
      finished = true;
      window.sessionStorage.setItem(SESSION_KEY, "1");
      window.setTimeout(() => setPhase("done"), HOLD_MS);
    };

    const frame = (now: number) => {
      if (start === 0) start = now;
      const elapsed = (now - start) / ASSEMBLE_MS;
      setProgress(Math.min(elapsed, 1));

      const { width, height } = canvas;
      const dot = Math.max(1, Math.round((width / COLS) * 0.62));

      context.clearRect(0, 0, width, height);

      for (const point of points) {
        // Each point runs its own clock, offset by its dither threshold.
        const local = Math.max(0, Math.min((elapsed - point.delay) / (1 - point.delay), 1));
        const eased = ease(local);
        const x = (point.sx + (point.tx - point.sx) * eased) * width;
        const y = (point.sy + (point.ty - point.sy) * eased) * height;

        context.globalAlpha = point.shade * Math.min(local * 1.6, 1);
        context.fillStyle = local >= 1 ? "#ecedef" : "#a79bff";
        context.fillRect(Math.round(x), Math.round(y), dot, dot);
      }
      context.globalAlpha = 1;

      if (elapsed >= 1) {
        finish();
        return;
      }
      rafId = window.requestAnimationFrame(frame);
    };

    rafId = window.requestAnimationFrame(frame);

    // A stuck rAF (backgrounded tab on arrival) must never trap the visitor.
    const failsafe = window.setTimeout(finish, ASSEMBLE_MS + 1400);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(failsafe);
      window.removeEventListener("resize", resize);
    };
  }, [phase]);

  function skip() {
    window.sessionStorage.setItem(SESSION_KEY, "1");
    setPhase("done");
  }

  if (phase === "done") return null;

  return (
    <div
      className="north-preloader fixed inset-0 z-[200] flex flex-col items-center justify-center bg-void transition-[opacity,filter] duration-[620ms] ease-[var(--ease-north)]"
      style={{
        opacity: progress >= 1 ? 0 : 1,
        filter: progress >= 1 ? "blur(14px)" : "blur(0px)",
      }}
      role="status"
      aria-live="polite"
      aria-label={copy.preloader.calibrating}
    >
      <canvas ref={canvasRef} aria-hidden />

      {/* Calibration readout: the compass swinging onto 000° before the
          page's own instrument takes over. */}
      <div className="mt-10 flex items-center gap-4">
        <span aria-hidden className="relative block h-px w-24 bg-hairline">
          <span
            className="absolute inset-y-0 left-0 bg-signal transition-[width] duration-100 ease-linear"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </span>
        <span className="label-mono text-slate">{copy.preloader.calibrating}</span>
        {/* Settles onto north rather than cycling: the needle is finding
            000°, so the number has to be arriving at it, not passing through
            arbitrary headings. */}
        <span className="label-mono tabular-nums text-signal-lift">
          {String(Math.round((1 - progress) * 359)).padStart(3, "0")}°
        </span>
      </div>

      <button
        type="button"
        onClick={skip}
        className="label-mono absolute bottom-8 text-slate transition-colors duration-[var(--duration-state)] hover:text-ash"
      >
        {copy.preloader.skip}
      </button>
    </div>
  );
}
