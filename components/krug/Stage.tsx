"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";

import { outerWall, settle, type Profile } from "@/lib/krug/profile";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { cupStore, stageStore, useCup } from "./store";
import { VesselEngine, type Layout, type Mood } from "./VesselEngine";

gsap.registerPlugin(ScrollTrigger);

type HandleId = "foot" | "belly" | "neck" | "lip";

const HANDLES: readonly { id: HandleId; label: string }[] = [
  { id: "lip", label: "Край" },
  { id: "neck", label: "Горло" },
  { id: "belly", label: "Тулово" },
  { id: "foot", label: "Ножка" },
];

const at = (p: Profile, id: HandleId): [number, number] => (id === "foot" ? [p.foot, 0] : [p[id].r, p[id].y]);

function moved(p: Profile, id: HandleId, dr: number, dy: number): Profile {
  if (id === "foot") return settle({ ...p, foot: p.foot + dr });
  return settle({ ...p, [id]: { r: p[id].r + dr, y: p[id].y + dy } });
}

/** What each step of the process looks like: the ground the page turns, and the light on the pot. */
export const SCENES = ["cobalt", "cobalt", "kiln", "porcelain", "cobalt"] as const;
const MOODS: Record<(typeof SCENES)[number], Mood> = {
  cobalt: { kiln: 0, porcelain: 0 },
  kiln: { kiln: 1, porcelain: 0 },
  porcelain: { kiln: 0, porcelain: 1 },
};

const mix = (a: Layout, b: Layout, t: number): Layout => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  zoom: a.zoom + (b.zoom - a.zoom) * t,
});

/**
 * The one pot on the page, on a layer that stays put while the page moves.
 *
 * In the first screen it stands in the middle on the wheel, in front of
 * the studio's name, with four points on its wall to pull. As the process
 * comes up it walks to the left of the screen and stays there through
 * every step, changing as the steps pass beside it; the page's ground
 * changes with it, cobalt in the studio, dark in the kiln, white in the
 * glazing room. Once the process is over the rest of the page slides over
 * it and it stops drawing.
 */
export function Stage() {
  const reduced = useReducedMotion();
  const layer = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<VesselEngine | null>(null);
  const handles = useRef<Record<HandleId, HTMLButtonElement | null>>({ foot: null, belly: null, neck: null, lip: null });
  const overlay = useRef<HTMLDivElement>(null);
  const line = useRef<SVGPolylineElement>(null);
  const drag = useRef<{ id: HandleId; x: number; y: number; start: Profile } | null>(null);
  const touched = useCup((c) => c.touched);

  useEffect(() => {
    const el = canvas.current;
    const root = layer.current?.closest<HTMLElement>(".kr");
    if (!el || !root) return;
    const { profile, glaze } = cupStore.get();
    const e = new VesselEngine(el, profile, glaze, stageStore.get(), { air: 2.3 });
    engine.current = e;
    if (process.env.NODE_ENV !== "production") (window as unknown as { __krug?: VesselEngine }).__krug = e;

    const narrow = window.matchMedia("(max-width: 900px)");
    const presets = () =>
      narrow.matches
        ? { hero: { x: 0.5, y: 0.45, zoom: 0.74 }, process: { x: 0.5, y: 0.3, zoom: 0.72 } }
        : { hero: { x: 0.5, y: 0.49, zoom: 0.72 }, process: { x: 0.26, y: 0.5, zoom: 0.8 } };
    let walk = 0;
    e.setLayout(mix(presets().hero, presets().process, walk), true);

    // Keep the handles on the wall and the drawn profile beside it.
    e.onFrame = () => {
      const cur = cupStore.get().profile;
      for (const h of HANDLES) {
        const node = handles.current[h.id];
        if (!node) continue;
        const [r, y] = at(cur, h.id);
        const pt = e.project(r, y);
        node.style.transform = `translate3d(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px, 0)`;
      }
      line.current?.setAttribute(
        "points",
        outerWall(cur, 40)
          .map(([r, y]) => {
            const pt = e.project(r, y);
            return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
          })
          .join(" "),
      );
    };

    const ro = new ResizeObserver(() => e.resize());
    ro.observe(el);
    e.start();

    const applyStage = () => {
      const i = Math.round(stageStore.get());
      const scene = SCENES[i] ?? "cobalt";
      e.setStage(i);
      e.setMood(MOODS[scene]);
      root.dataset.scene = scene;
    };
    applyStage();
    const unStage = stageStore.subscribe(applyStage);
    const unCup = cupStore.subscribe(() => {
      const c = cupStore.get();
      e.setProfile(c.profile);
      e.setGlaze(c.glaze);
      e.redraw();
    });

    const ctx = gsap.context(() => {
      // The walk from the middle of the first screen to the left of the process.
      ScrollTrigger.create({
        trigger: "#process",
        start: "top bottom",
        end: "top top",
        onUpdate: (self) => {
          walk = self.progress;
          const p = presets();
          e.setLayout(mix(p.hero, p.process, walk));
          if (overlay.current) {
            const o = Math.max(0, 1 - walk * 3);
            overlay.current.style.opacity = String(o);
            overlay.current.style.visibility = o < 0.02 ? "hidden" : "visible";
          }
        },
      });
      // Past the process, the page covers the pot; stop drawing it.
      const off = () => {
        e.stop();
        layer.current?.setAttribute("data-off", "true");
      };
      const on = () => {
        layer.current?.removeAttribute("data-off");
        e.start();
      };
      const past = ScrollTrigger.create({
        trigger: "#process",
        start: "top bottom",
        end: "bottom top",
        onLeave: off,
        onEnterBack: on,
      });
      if (past.progress >= 1) off();
    });

    const onMedia = () => e.setLayout(mix(presets().hero, presets().process, walk), true);
    narrow.addEventListener("change", onMedia);

    return () => {
      narrow.removeEventListener("change", onMedia);
      ctx.revert();
      unStage();
      unCup();
      ro.disconnect();
      e.dispose();
      engine.current = null;
      delete root.dataset.scene;
    };
  }, []);

  useEffect(() => {
    if (engine.current) engine.current.spin = reduced ? 0 : 0.32;
  }, [reduced]);

  const onDown = (id: HandleId) => (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id, x: event.clientX, y: event.clientY, start: cupStore.get().profile };
  };

  const onMove = (event: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    const e = engine.current;
    if (!d || !e) return;
    const k = e.pxPerCm();
    const dr = (event.clientX - d.x) / k;
    const dy = -(event.clientY - d.y) / k;
    cupStore.set({ profile: moved(d.start, d.id, dr, d.id === "foot" ? 0 : dy), touched: true });
  };

  const onUp = () => {
    drag.current = null;
  };

  const onKey = (id: HandleId) => (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 1 : 0.25;
    const map: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const delta = map[event.key];
    if (!delta) return;
    event.preventDefault();
    cupStore.set({ profile: moved(cupStore.get().profile, id, delta[0], id === "foot" ? 0 : delta[1]), touched: true });
  };

  return (
    <div ref={layer} className="kr-stage">
      <canvas ref={canvas} className="kr-stage-canvas" aria-hidden />
      <div ref={overlay} className="kr-stage-overlay" data-touched={touched}>
        <svg className="kr-stage-line" aria-hidden>
          <polyline ref={line} />
        </svg>
        {HANDLES.map((h) => (
          <button
            key={h.id}
            ref={(node) => {
              handles.current[h.id] = node;
            }}
            type="button"
            className="kr-handle"
            data-id={h.id}
            aria-label={`${h.label}: потяните или двигайте стрелками`}
            onPointerDown={onDown(h.id)}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onKeyDown={onKey(h.id)}
          >
            <span className="kr-handle-dot" />
            <span className="kr-handle-label">{h.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
