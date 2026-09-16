"use client";

import { useEffect, useRef } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";

/** How long a mark stays on the paper before it has dried away. */
const LIFE_MS = 520;
const MAX_POINTS = 48;

interface Mark {
  x: number;
  y: number;
  t: number;
}

/**
 * The cursor as a pen nib.
 *
 * The real cursor stays exactly as it is; behind it, a hairline of cobalt
 * ink trails the pointer and dries away within half a second, thinning as
 * it goes. It draws on one fixed canvas, only while the pointer is moving,
 * and never on touch screens, where there is no pointer to follow.
 */
export function PenTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cobalt =
      getComputedStyle(document.documentElement).getPropertyValue("--color-cobalt").trim() ||
      "#1b2ed8";
    const marks: Mark[] = [];
    let frame = 0;
    let dpr = 1;

    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
    };
    size();

    const draw = (now: number) => {
      frame = 0;
      while (marks.length && now - marks[0]!.t > LIFE_MS) marks.shift();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.strokeStyle = cobalt;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let i = 1; i < marks.length; i += 1) {
        const a = marks[i - 1]!;
        const b = marks[i]!;
        const life = 1 - (now - b.t) / LIFE_MS;
        if (life <= 0) continue;
        ctx.globalAlpha = life * 0.85;
        ctx.lineWidth = 0.6 + life * 1.8;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      if (marks.length > 1) frame = window.requestAnimationFrame(draw);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      marks.push({ x: event.clientX, y: event.clientY, t: performance.now() });
      if (marks.length > MAX_POINTS) marks.shift();
      if (!frame) frame = window.requestAnimationFrame(draw);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", size);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", size);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[95] h-full w-full"
    />
  );
}
