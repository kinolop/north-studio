"use client";

import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";

import { scrollToSection } from "@/components/motion/SmoothScroll";
import { FIRST_CUP, clayGrams, cm, outerWall, settle, vesselName, volumeMl, widest, type Profile } from "@/lib/krug/profile";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { cupStore, useCup } from "./store";
import { VesselEngine } from "./VesselEngine";

type HandleId = "foot" | "belly" | "neck" | "lip";

const HANDLES: readonly { id: HandleId; label: string }[] = [
  { id: "lip", label: "Край" },
  { id: "neck", label: "Горло" },
  { id: "belly", label: "Тулово" },
  { id: "foot", label: "Ножка" },
];

const at = (p: Profile, id: HandleId): [number, number] =>
  id === "foot" ? [p.foot, 0] : [p[id].r, p[id].y];

/** Move one control point by a delta in centimetres, then make the pot possible again. */
function moved(p: Profile, id: HandleId, dr: number, dy: number): Profile {
  if (id === "foot") return settle({ ...p, foot: p.foot + dr });
  return settle({ ...p, [id]: { r: p[id].r + dr, y: p[id].y + dy } });
}

/**
 * The first screen: a lump of clay already opened into a cup, turning on
 * the wheel, and four points on its wall that the visitor can pull. It is
 * the studio's whole offer in one gesture, the thing a first evening is
 * actually spent doing, and the readout under it says what has been made
 * in the words a potter would use.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<VesselEngine | null>(null);
  const handles = useRef<Record<HandleId, HTMLButtonElement | null>>({ foot: null, belly: null, neck: null, lip: null });
  const line = useRef<SVGPolylineElement>(null);
  const drag = useRef<{ id: HandleId; x: number; y: number; start: Profile } | null>(null);

  const profile = useCup((c) => c.profile);
  const touched = useCup((c) => c.touched);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const { profile: p, glaze } = cupStore.get();
    const e = new VesselEngine(el, p, glaze, 0, { wheelAlways: true, air: 2.3, anchorX: 0.5 });
    engine.current = e;

    const place = () => {
      const cur = cupStore.get().profile;
      for (const h of HANDLES) {
        const node = handles.current[h.id];
        if (!node) continue;
        const [r, y] = at(cur, h.id);
        const pt = e.project(r, y);
        node.style.transform = `translate3d(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px, 0)`;
      }
      if (line.current) {
        line.current.setAttribute(
          "points",
          outerWall(cur, 40)
            .map(([r, y]) => {
              const pt = e.project(r, y);
              return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
            })
            .join(" "),
        );
      }
    };
    e.onFrame = place;

    const ro = new ResizeObserver(() => e.resize());
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => (entry?.isIntersecting ? e.start() : e.stop()), {
      rootMargin: "80px",
    });
    io.observe(el);
    const unsub = cupStore.subscribe(() => {
      e.setProfile(cupStore.get().profile);
      e.redraw();
    });

    return () => {
      unsub();
      io.disconnect();
      ro.disconnect();
      e.dispose();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    if (engine.current) engine.current.spin = reduced ? 0 : 0.32;
  }, [reduced]);

  const onDown = (id: HandleId) => (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id, x: event.clientX, y: event.clientY, start: cupStore.get().profile };
    document.documentElement.dataset.krDragging = "true";
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
    delete document.documentElement.dataset.krDragging;
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
    const [dr, dy] = delta;
    cupStore.set({ profile: moved(cupStore.get().profile, id, dr, id === "foot" ? 0 : dy), touched: true });
  };

  const name = vesselName(profile);
  const ml = Math.round(volumeMl(profile) / 10) * 10;
  const grams = Math.round(clayGrams(profile) / 10) * 10;

  return (
    <section id="top" className="kr-hero" aria-labelledby="kr-hero-title">
      <div className="kr-wrap kr-hero-grid">
        <div className="kr-hero-copy">
          <p className="kr-eyebrow">Гончарная мастерская на Бауманской</p>
          <h1 id="kr-hero-title" className="kr-h1">
            Первая чашка
            <br />
            <em>за один вечер</em>
          </h1>
          <p className="kr-lead">
            Два часа за кругом рядом с мастером. То, что у вас получится, мы обточим, покроем глазурью и обожжём, а
            через две-три недели чашку можно забрать.
          </p>
          <div className="kr-hero-cta">
            <a
              href="#book"
              className="kr-btn"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("book");
              }}
            >
              Записаться на первое занятие
            </a>
            <p className="kr-hero-price">
              <span className="kr-num">3&thinsp;500&nbsp;₽</span> глина, глазурь и&nbsp;два обжига включены
            </p>
          </div>
        </div>

        <div className="kr-wheel">
          <canvas ref={canvas} className="kr-wheel-canvas" aria-hidden />
          <svg className="kr-wheel-line" aria-hidden>
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
          <p className="kr-wheel-hint" data-hidden={touched}>
            Потяните за точки на стенке: так её вытягивают на круге
          </p>
          <div className="kr-readout" aria-live="polite">
            <p className="kr-readout-name">
              Получается <strong>{name}</strong>
            </p>
            <p className="kr-readout-figs kr-num">
              <span>Ø {cm(widest(profile))} см</span>
              <span>высота {cm(profile.lip.y)} см</span>
              <span>{ml} мл</span>
              <span>{grams} г глины</span>
            </p>
            {touched && (
              <button type="button" className="kr-link kr-readout-reset" onClick={() => cupStore.set({ profile: FIRST_CUP })}>
                Вернуть чашку
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
