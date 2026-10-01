"use client";

import { useEffect, useRef } from "react";

import { num } from "@/lib/marshrut/format";
import { PALLET } from "@/lib/marshrut/pack";

import { useEngine } from "./engineStore";
import { useQuote } from "./store";

/**
 * The pallet, dimensioned like a drawing.
 *
 * While the camera is next to the cargo, the pallet is annotated the way an
 * engineer would annotate it: witness lines off the corners, a dimension
 * line with slash ends, the size in millimetres. The numbers are the real
 * ones from the packing (1200 by 800 for the pallet, whatever height the
 * cartons stack to), and beneath them sits the line that matters for the
 * price: how many cartons, how many kilograms, how many cubic metres.
 *
 * It fades out as the camera leaves, at the same moment the ruler starts to
 * read kilometres.
 */

const NS = "http://www.w3.org/2000/svg";

function el<K extends keyof SVGElementTagNameMap>(tag: K, cls: string, parent: Element): SVGElementTagNameMap[K] {
  const node = document.createElementNS(NS, tag);
  node.setAttribute("class", cls);
  parent.appendChild(node);
  return node;
}

export function Dims() {
  const engine = useEngine();
  const q = useQuote();
  const svgRef = useRef<SVGSVGElement>(null);
  const info = useRef({ perPallet: 0, kg: 0, m3: 0, index: 1, total: 1 });

  const carton = q.product.carton;
  const cartonM3 = (carton[0] * carton[1] * carton[2]) / 1_000_000;
  const shown = Math.min(q.cartons, q.pallets.perPallet);
  info.current = {
    perPallet: shown,
    kg: shown * q.product.cartonKg,
    m3: shown * cartonM3,
    index: 1,
    total: q.pallets.pallets,
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!engine || !svg) return;
    svg.replaceChildren();

    const lines = Array.from({ length: 9 }, () => el("line", "mr-dim-line", svg));
    const ticks = Array.from({ length: 6 }, () => el("line", "mr-dim-line", svg));
    const texts = Array.from({ length: 4 }, () => el("text", "mr-dim-text", svg));

    let last = -1;
    const unsubscribe = engine.subscribe((hud) => {
      if (hud.serial === last) return;
      last = hud.serial;
      const fade = Math.max(0, Math.min(1, (16 - hud.d) / 7));
      const visible = fade > 0.01 && engine.routePlan !== null;
      svg.style.opacity = visible ? String(fade) : "0";
      if (!visible) return;

      const c = engine.cameraInCargoFrame();
      const sx = c.x >= 0 ? 1 : -1;
      const sz = c.z >= 0 ? 1 : -1;
      const L = PALLET.w / 2;
      const D = PALLET.d / 2;
      const H = engine.cargoDims.h;
      const off = 0.36;

      const P = (x: number, y: number, z: number) => {
        const w = engine.cargoPoint(x, y, z);
        return engine.project(w.x, w.y, w.z);
      };
      const set = (line: SVGLineElement, a: { x: number; y: number }, b: { x: number; y: number }) => {
        line.setAttribute("x1", a.x.toFixed(1));
        line.setAttribute("y1", a.y.toFixed(1));
        line.setAttribute("x2", b.x.toFixed(1));
        line.setAttribute("y2", b.y.toFixed(1));
      };
      const slash = (line: SVGLineElement, p: { x: number; y: number }) =>
        set(line, { x: p.x - 4, y: p.y + 4 }, { x: p.x + 4, y: p.y - 4 });
      const label = (
        text: SVGTextElement,
        a: { x: number; y: number },
        b: { x: number; y: number },
        value: string,
        push = 12,
      ) => {
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        // Nudge the text off the line, toward the top of the screen.
        let nx = -dy / len;
        let ny = dx / len;
        if (ny > 0) {
          nx = -nx;
          ny = -ny;
        }
        text.setAttribute("x", (mx + nx * push).toFixed(1));
        text.setAttribute("y", (my + ny * push).toFixed(1));
        text.setAttribute("text-anchor", "middle");
        text.textContent = value;
      };

      // Length, along the near long side.
      const zl = sz * (D + off);
      const l1 = P(-L, 0, zl);
      const l2 = P(L, 0, zl);
      set(lines[0]!, l1, l2);
      set(lines[1]!, P(-L, 0, sz * D), P(-L, 0, sz * (D + off + 0.06)));
      set(lines[2]!, P(L, 0, sz * D), P(L, 0, sz * (D + off + 0.06)));
      slash(ticks[0]!, l1);
      slash(ticks[1]!, l2);
      label(texts[0]!, l1, l2, num(PALLET.w * 1000));

      // Width, along the near short side.
      const xw = sx * (L + off);
      const w1 = P(xw, 0, -D);
      const w2 = P(xw, 0, D);
      set(lines[3]!, w1, w2);
      set(lines[4]!, P(sx * L, 0, -D), P(sx * (L + off + 0.06), 0, -D));
      set(lines[5]!, P(sx * L, 0, D), P(sx * (L + off + 0.06), 0, D));
      slash(ticks[2]!, w1);
      slash(ticks[3]!, w2);
      label(texts[1]!, w1, w2, num(PALLET.d * 1000));

      // Height, on the corner that faces away, so it never crosses the other two.
      const xh = -sx * (L + 0.24);
      const zh = sz * (D + 0.24);
      const h1 = P(xh, 0, zh);
      const h2 = P(xh, H, zh);
      set(lines[6]!, h1, h2);
      set(lines[7]!, P(-sx * L, 0, sz * D), P(xh, 0, zh + sz * 0.05));
      set(lines[8]!, P(-sx * L, H, sz * D), P(xh, H, zh + sz * 0.05));
      slash(ticks[4]!, h1);
      slash(ticks[5]!, h2);
      label(texts[2]!, h1, h2, num(Math.round(H * 1000)), 14);

      // What this pallet is worth to the price.
      const top = P(0, H + 0.06, 0);
      const i = info.current;
      texts[3]!.setAttribute("x", top.x.toFixed(1));
      texts[3]!.setAttribute("y", (top.y - 8).toFixed(1));
      texts[3]!.setAttribute("text-anchor", "middle");
      texts[3]!.setAttribute("class", "mr-dim-text mr-dim-text-strong");
      texts[3]!.textContent = `Паллета 1 из ${i.total}: ${i.perPallet} кор., ${num(Math.round(i.kg))} кг, ${num(i.m3, 2)} м³`;
    });
    return () => {
      unsubscribe();
      svg.replaceChildren();
    };
  }, [engine]);

  return <svg ref={svgRef} className="mr-dims" aria-hidden />;
}
