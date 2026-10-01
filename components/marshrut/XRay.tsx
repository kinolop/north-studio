"use client";

import { useEffect, useRef } from "react";

import type { ProductId } from "@/lib/marshrut/data";
import { num } from "@/lib/marshrut/format";
import type { Quote } from "@/lib/marshrut/model";
import { mulberry32 } from "@/lib/marshrut/util";

import { moment } from "./moment";

/**
 * The customs scanner's picture of the container.
 *
 * At the border the container goes through an inspection scanner, and the
 * officer sees it the way an X-ray sees it: steel bright, wood and card
 * faint, what is inside the cartons as the shapes of its densest parts. The
 * picture is drawn from the reader's own calculation: their pallets, their
 * cartons, their product (folded shirts as layers, mugs as rings, sneakers
 * as soles), packed among other clients' cargo, because a container from
 * China is almost always shared. Their pallets carry the route's amber.
 *
 * The scan line crosses with the scroll; behind it the picture develops.
 */

const W = 1200;
const H = 330;
/** A forty-foot container's inside, metres, and the drawing's scale. */
const BOX_L = 12.0;
const BOX_H = 2.6;
const PAD_X = 40;
const PAD_Y = 34;
const SX = (W - PAD_X * 2) / BOX_L;
const SY = (H - PAD_Y * 2) / BOX_H;

type Ctx = CanvasRenderingContext2D;

/** What one product looks like inside its carton under X-ray, in a cell of the carton. */
function contents(ctx: Ctx, id: ProductId, x: number, y: number, w: number, h: number, random: () => number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  switch (id) {
    case "tshirt":
    case "hoodie": {
      // Folded garments: soft horizontal layers.
      const layer = id === "hoodie" ? 9 : 5.5;
      for (let yy = y + 3; yy < y + h - 2; yy += layer) {
        ctx.globalAlpha = 0.18 + random() * 0.1;
        ctx.beginPath();
        ctx.moveTo(x + 2, yy);
        for (let xx = x + 2; xx < x + w - 2; xx += 6) ctx.lineTo(xx, yy + Math.sin(xx * 0.3 + yy) * 0.8);
        ctx.lineWidth = layer * 0.55;
        ctx.stroke();
      }
      break;
    }
    case "mug": {
      // Ceramic is dense: bright rings with handles.
      for (let yy = y + 7; yy < y + h - 5; yy += 13) {
        for (let xx = x + 7; xx < x + w - 6; xx += 13) {
          ctx.globalAlpha = 0.55;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(xx, yy, 4.6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(xx + 5.4, yy, 2, -1.2, 1.2);
          ctx.stroke();
        }
      }
      break;
    }
    case "sneakers": {
      // Shoe boxes, and in each the dense line of a sole.
      for (let yy = y + 4; yy < y + h - 8; yy += 12) {
        ctx.globalAlpha = 0.16;
        ctx.strokeRect(x + 2, yy, w - 4, 10);
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x + 5, yy + 8);
        ctx.quadraticCurveTo(x + w * 0.5, yy + 9.5, x + w - 6, yy + 6);
        ctx.stroke();
      }
      break;
    }
    case "plush": {
      // Soft toys: faint round shapes with the bright points of their eyes.
      for (let i = 0; i < 6; i++) {
        const cx = x + 6 + random() * (w - 12);
        const cy = y + 6 + random() * (h - 12);
        ctx.globalAlpha = 0.1;
        ctx.beginPath();
        ctx.arc(cx, cy, 7 + random() * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.7;
        ctx.fillRect(cx - 2.5, cy - 2, 1.4, 1.4);
        ctx.fillRect(cx + 1.5, cy - 2, 1.4, 1.4);
      }
      break;
    }
    default: {
      // Phone cases: thin dense plates, stacked.
      for (let yy = y + 3; yy < y + h - 2; yy += 3.2) {
        ctx.globalAlpha = 0.28;
        ctx.fillRect(x + 4, yy, w - 8, 1.2);
      }
    }
  }
  ctx.restore();
}

function draw(canvas: HTMLCanvasElement, q: Quote) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const random = mulberry32(5510_3382);

  ctx.fillStyle = "#06070a";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#dfe6ee";
  ctx.fillStyle = "#dfe6ee";

  const X = (m: number) => PAD_X + m * SX;
  const Y = (m: number) => H - PAD_Y - m * SY;

  // The container: bright steel frame, corrugated walls, floor cross-members.
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 3;
  ctx.strokeRect(X(0), Y(BOX_H), BOX_L * SX, BOX_H * SY);
  ctx.globalAlpha = 0.07;
  ctx.lineWidth = 1;
  for (let m = 0.15; m < BOX_L; m += 0.28) {
    ctx.beginPath();
    ctx.moveTo(X(m), Y(BOX_H));
    ctx.lineTo(X(m), Y(0));
    ctx.stroke();
  }
  ctx.globalAlpha = 0.5;
  for (let m = 0.2; m < BOX_L; m += 0.6) ctx.fillRect(X(m), Y(0) - 2, 5, 6);
  // Door gear at the right end.
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 2;
  for (const dz of [0.15, 0.45]) {
    ctx.beginPath();
    ctx.moveTo(X(BOX_L - dz), Y(BOX_H) + 4);
    ctx.lineTo(X(BOX_L - dz), Y(0) - 4);
    ctx.stroke();
  }

  const PL = 1.2;
  const PH = 0.14;
  const stack = Math.min(2.3, Math.max(0.9, q.pallets.height));
  const ours = Math.max(1, q.pallets.pallets);
  // Our pallets stand nearest the doors, the way the last consignment loaded is the first out.
  const slots = Math.floor(BOX_L / (PL + 0.04));
  const oursFrom = Math.max(0, slots - ours);

  for (let i = 0; i < slots; i++) {
    const x0 = 0.05 + i * (PL + 0.04);
    const mine = i >= oursFrom;
    const height = mine ? stack : 0.9 + random() * 1.3;
    // The pallet: wood, faint, with the bright line of its nails.
    ctx.globalAlpha = 0.32;
    ctx.fillRect(X(x0), Y(PH), PL * SX, PH * SY);
    ctx.globalAlpha = 0.6;
    ctx.fillRect(X(x0), Y(PH) + 1, PL * SX, 1.2);
    // Cartons.
    const rows = mine ? Math.max(1, Math.round((stack - PH) / 0.4)) : 2 + Math.floor(random() * 3);
    const cols = 2;
    const ch = (height - PH) / rows;
    const cw = PL / cols;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = X(x0 + c * cw);
        const cy = Y(PH + (r + 1) * ch);
        const w = cw * SX - 2;
        const h = ch * SY - 2;
        ctx.globalAlpha = mine ? 0.2 : 0.12;
        ctx.lineWidth = 1;
        ctx.strokeRect(cx + 1, cy + 1, w, h);
        if (mine) contents(ctx, q.product.id, cx + 1, cy + 1, w, h, random);
        else {
          // Other people's cargo: whatever it is, a texture of its own.
          const kind = (["tshirt", "mug", "case", "sneakers", "plush"] as const)[Math.floor(random() * 5)]!;
          ctx.save();
          ctx.globalAlpha = 0.55;
          contents(ctx, kind, cx + 1, cy + 1, w, h, random);
          ctx.restore();
        }
      }
    }
  }

  // Our consignment, ringed in the route's amber.
  ctx.globalAlpha = 0.95;
  ctx.strokeStyle = "#dc9f4b";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  const ax = X(0.05 + oursFrom * (PL + 0.04)) - 5;
  const aw = (BOX_L - 0.05 - oursFrom * (PL + 0.04)) * SX + 2;
  ctx.strokeRect(ax, Y(stack) - 8, aw, stack * SY + 10);
  ctx.setLineDash([]);
  ctx.fillStyle = "#dc9f4b";
  ctx.font = `500 13px ${getComputedStyle(canvas.parentElement ?? canvas).fontFamily || "monospace"}`;
  ctx.textAlign = "right";
  ctx.fillText(`MR-0417 · ${num(q.pallets.pallets)} пал. · ${num(q.cartons)} кор.`, ax + aw, Y(stack) - 16);

  // Detector grain.
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (random() - 0.5) * 18;
    d[i] = Math.max(0, Math.min(255, d[i]! + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1]! + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2]! + n * 1.1));
  }
  ctx.putImageData(img, 0, 0);
}

export function XRay({ q, place, time }: { q: Quote; place: string; time: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const c = canvas.current;
    if (c) draw(c, q);
  }, [q]);

  // The scan crosses the container in the first part of the border chapter.
  useEffect(() => {
    let last = -1;
    return moment.subscribe((m) => {
      const el = root.current;
      if (!el) return;
      const p = m.chapter > 4 ? 1 : m.chapter < 4 ? 0 : Math.min(1, Math.max(0, (m.local - 0.04) / 0.38));
      const k = Math.round(p * 500) / 500;
      if (k === last) return;
      last = k;
      el.style.setProperty("--scan", k.toFixed(3));
      el.dataset.done = k >= 1 ? "true" : "false";
    });
  }, []);

  return (
    <figure ref={root} className="mr-xray" data-done="false" aria-label="Снимок досмотрового комплекса: контейнер с паллетами">
      <figcaption className="mr-xray-head mr-num">
        <span>ИДК · {place} · {time}</span>
        <span>MRSU 551038 2</span>
      </figcaption>
      <div className="mr-xray-frame">
        <canvas ref={canvas} className="mr-xray-img" />
        <i className="mr-xray-line" aria-hidden />
      </div>
      <p className="mr-xray-foot">
        Сверено с декларацией: {num(q.pallets.pallets)} пал., {num(q.cartons)} кор., {q.product.goods.toLowerCase()}.
      </p>
    </figure>
  );
}
