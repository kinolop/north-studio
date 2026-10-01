"use client";

import { useEffect, useRef } from "react";

import { unproject } from "@/lib/marshrut/geo";

import type { Hud } from "./engine/Engine";
import { useEngine } from "./engineStore";

/**
 * The frame around the picture, and it is a ruler.
 *
 * The top and left edges measure the screen itself: a tick every so many
 * metres, counted from the corner. So at any moment the frame says how big
 * the thing being shown is (a pallet is 1,2 m across, Eurasia is 9 000 km),
 * and when the camera climbs the labels run through millimetres, metres and
 * kilometres like the digits of a meter. It is the one place where the page
 * says out loud that a carton and a continent are the same shipment.
 *
 * Drawn on a canvas of its own and redrawn only when the engine says the
 * view moved.
 */

const MINOR_PX = 11;

const UNITS: { limit: number; unit: number; name: string }[] = [
  { limit: 0.02, unit: 0.001, name: "мм" },
  { limit: 1, unit: 0.01, name: "см" },
  { limit: 1000, unit: 1, name: "м" },
  { limit: Infinity, unit: 1000, name: "км" },
];

function unitFor(step: number) {
  return UNITS.find((u) => step < u.limit) ?? (UNITS[UNITS.length - 1] as (typeof UNITS)[number]);
}

function label(value: number, step: number): string {
  const u = unitFor(step);
  const n = value / u.unit;
  const digits = Math.abs(n) < 10 && !Number.isInteger(Math.round(n * 100) / 100) ? 1 : 0;
  const text = n.toFixed(Math.abs(n) >= 100 ? 0 : digits).replace(".", ",");
  const grouped = text.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped} ${u.name}`;
}

function draw(
  ctx: CanvasRenderingContext2D,
  hud: Hud,
  font: string,
  ink: string,
) {
  const { width: W, height: H } = hud;
  ctx.clearRect(0, 0, W, H);
  const inset = 6;
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.font = `500 9.5px ${font}`;
  ctx.textBaseline = "top";

  const axis = (mpp: number, length: number, horizontal: boolean) => {
    // Smallest power of ten that keeps ticks at least MINOR_PX apart.
    const wanted = MINOR_PX * mpp;
    const base = Math.pow(10, Math.ceil(Math.log10(wanted)));
    const spacing = base / mpp;
    // Ticks of the next-finer decade fade in as the spacing grows.
    const fine = base / 10;
    const fineSpacing = fine / mpp;
    const fineAlpha = Math.max(0, Math.min(1, (fineSpacing - MINOR_PX * 0.55) / (MINOR_PX * 0.6)));

    // Label every m-th tick, the smallest m that leaves the words room.
    const m = ([1, 2, 5, 10] as const).find((k) => k * spacing >= 84) ?? 10;
    const count = Math.ceil(length / spacing);
    for (let i = 0; i <= count; i++) {
      const p = i * spacing;
      if (p > length) break;
      const major = i % m === 0;
      const half = m >= 5 ? i % (m / 5) === 0 : i % 5 === 0;
      const size = major ? 9 : half ? 6 : 3.5;
      ctx.globalAlpha = major ? 0.7 : half ? 0.5 : 0.34;
      ctx.beginPath();
      if (horizontal) {
        ctx.moveTo(Math.round(p) + 0.5, inset);
        ctx.lineTo(Math.round(p) + 0.5, inset + size);
      } else {
        ctx.moveTo(inset, Math.round(p) + 0.5);
        ctx.lineTo(inset + size, Math.round(p) + 0.5);
      }
      ctx.stroke();
      if (major && i > 0 && p < length - 34) {
        ctx.globalAlpha = 0.62;
        const text = label(i * base, base * m);
        if (horizontal) ctx.fillText(text, Math.round(p) + 4, inset + 3);
        else {
          ctx.save();
          ctx.translate(inset + 3, Math.round(p) + 4);
          ctx.rotate(Math.PI / 2);
          ctx.fillText(text, 0, 0);
          ctx.restore();
        }
      }
    }
    if (fineAlpha > 0.02) {
      ctx.globalAlpha = 0.26 * fineAlpha;
      const fc = Math.min(Math.ceil(length / fineSpacing), 1600);
      for (let i = 0; i <= fc; i++) {
        if (i % 10 === 0) continue;
        const p = i * fineSpacing;
        ctx.beginPath();
        if (horizontal) {
          ctx.moveTo(Math.round(p) + 0.5, inset);
          ctx.lineTo(Math.round(p) + 0.5, inset + 2.5);
        } else {
          ctx.moveTo(inset, Math.round(p) + 0.5);
          ctx.lineTo(inset + 2.5, Math.round(p) + 0.5);
        }
        ctx.stroke();
      }
    }
  };

  ctx.lineWidth = 1;
  axis(hud.mppX, W, true);
  axis(hud.mppY, H, false);

  // The two far edges only carry the frame line, so the box closes.
  ctx.globalAlpha = 0.28;
  ctx.beginPath();
  ctx.moveTo(inset + 0.5, inset + 0.5);
  ctx.lineTo(W - inset - 0.5, inset + 0.5);
  ctx.lineTo(W - inset - 0.5, H - inset - 0.5);
  ctx.lineTo(inset + 0.5, H - inset - 0.5);
  ctx.closePath();
  ctx.stroke();
  ctx.globalAlpha = 1;
}

const dms = (deg: number, pos: string, neg: string) => {
  const a = Math.abs(deg);
  const d = Math.floor(a);
  const m = Math.floor((a - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}′ ${deg >= 0 ? pos : neg}`;
};

export function Ruler() {
  const engine = useEngine();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!engine || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const style = getComputedStyle(canvas);
    const font = style.getPropertyValue("--mono").trim() || "monospace";
    const ink = style.getPropertyValue("--bone").trim() || "#e8e4da";

    let lastSerial = -1;
    let lastSize = "";
    return engine.subscribe((hud) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const size = `${hud.width}x${hud.height}@${dpr}`;
      if (size !== lastSize) {
        canvas.width = Math.round(hud.width * dpr);
        canvas.height = Math.round(hud.height * dpr);
        lastSize = size;
        lastSerial = -1;
      }
      if (hud.serial === lastSerial) return;
      lastSerial = hud.serial;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(ctx, hud, font, ink);

      const el = readoutRef.current;
      if (!el) return;
      if (!hud.cursor.on) {
        el.dataset.on = "false";
        return;
      }
      el.dataset.on = "true";
      if (hud.atlas > 0.5) {
        const [lon, lat] = unproject(hud.cursor.x, hud.cursor.z);
        el.textContent = `${dms(lat, "с. ш.", "ю. ш.")}   ${dms(lon, "в. д.", "з. д.")}`;
      } else {
        const x = hud.cursor.x;
        const z = hud.cursor.z;
        el.textContent = `X ${(x * 100).toFixed(0)}   Z ${(z * 100).toFixed(0)} см`;
      }
    });
  }, [engine]);

  return (
    <>
      <canvas ref={canvasRef} className="mr-ruler" aria-hidden />
      <div ref={readoutRef} className="mr-readout" data-on="false" aria-hidden />
    </>
  );
}
