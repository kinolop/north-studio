"use client";

import { useEffect, useRef } from "react";

import { qualityTier } from "@/lib/quality";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { boot } from "./boot";
import { Director, type Rect } from "./director";
import { MarshrutEngine } from "./engine/Engine";
import { setEngine } from "./engineStore";
import { moment } from "./moment";
import { decode, encode } from "./share";
import { calc, quoteOf } from "./store";

declare global {
  interface Window {
    __mr?: MarshrutEngine;
    __mrCalc?: typeof calc;
    __mrDirector?: Director;
  }
}

export type { Rect };

/**
 * Where on the first screen the route may be drawn, clear of the words. The
 * first screen registers it; until it has, the whole width is fair game.
 */
export const heroFrame: { current: () => Rect } = {
  current: () => ({ x0: -0.92, x1: 0.92, y0: 0.14, y1: 0.8 }),
};

/**
 * Mounts the engine behind the whole page and keeps it in step with the
 * scroll and the calculation.
 *
 * The opening is one continuous move played once the container doors open:
 * the cartons land on the pallet under the lamp, and the camera climbs away
 * until the pallet is a mark on a night map of Eurasia. From then on the
 * director has the camera, and the scroll moves it.
 *
 * When the cargo changes on the first screen, the camera dips back to the
 * pallet to show the cartons rearranging, then rises to the route again.
 */
export function Stage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    boot.reset();
    let fontsDone = false;
    const fonts = document.fonts?.ready ?? Promise.resolve();
    void fonts.then(() => {
      fontsDone = true;
      boot.step("fonts");
    });

    let engine: MarshrutEngine;
    try {
      engine = new MarshrutEngine(canvas, { low: qualityTier() === "low", reduced });
    } catch {
      // No WebGL: the words and the numbers still work without the picture.
      canvas.dataset.gl = "off";
      void fonts.then(() => boot.ready());
      return;
    }
    canvas.dataset.gl = "on";
    boot.step("engine");
    if (process.env.NODE_ENV !== "production") {
      window.__mr = engine;
      window.__mrCalc = calc;
    }
    setEngine(engine);

    const shared = decode(location.hash);
    if (shared) calc.set(shared);

    engine.resize();
    engine.setQuote(quoteOf(calc.get()));

    const director = new Director(engine, () => heroFrame.current());
    director.setQuote(quoteOf(calc.get()));
    if (process.env.NODE_ENV !== "production") window.__mrDirector = director;

    // While the doors are shut the camera waits at the pallet, so opening them shows it.
    engine.setView(engine.viewFor("dock"));
    engine.start();

    /** The director has the camera once the opening is over. */
    let directing = reduced;
    let opened = reduced;
    // In development, ?p=0.4 (share of the page) or a pin holds a frame for judging.
    const pin = process.env.NODE_ENV !== "production" ? new URLSearchParams(location.search).get("p") : null;

    const vh = () => window.innerHeight;
    const tick = () => {
      const out = director.at(window.scrollY, vh());
      if (!out) return;
      moment.set(out.moment);
      if (directing) engine.setRig(out.rig);
    };
    const stopTick = engine.onBeforeFrame(tick);

    director.measure();
    const remeasure = () => {
      director.measure();
    };
    const sections = new ResizeObserver(remeasure);
    const root = document.getElementById("origin");
    if (root) sections.observe(root);

    const ro = new ResizeObserver(() => {
      if (engine.resize()) director.invalidate();
      director.measure();
    });
    ro.observe(canvas);

    // The pointer gives the camera a little parallax and the ruler a cursor to read.
    const onMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -((event.clientY / window.innerHeight) * 2 - 1);
      engine.setPointer(x, y, true);
    };
    const onLeave = () => engine.setPointer(0, 0, false);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    let cancelled = false;
    const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
    const flight = (view: Parameters<MarshrutEngine["flyTo"]>[0], seconds?: number) =>
      new Promise<void>((resolve) => engine.flyTo(view, { seconds, done: resolve }));

    // Real progress for the loader: the map, then every shader compiled once.
    const mapReady = engine
      .loadMap()
      .then(() => {
        if (cancelled) return;
        boot.step("map");
        engine.warm();
        engine.renderNow();
        boot.step("shaders");
      })
      .catch(() => undefined);
    void Promise.all([mapReady, fonts]).then(() => {
      if (cancelled) return;
      if (!fontsDone) boot.step("fonts");
      director.measure();
      boot.ready();
    });

    const handOver = () => {
      opened = true;
      directing = true;
      const out = director.at(window.scrollY, vh());
      if (out) engine.setRig(out.rig);
    };

    let skipped = false;
    const open = async () => {
      if (pin !== null || reduced) {
        await mapReady;
        if (pin !== null) {
          const p = Math.min(1, Math.max(0, Number(pin) || 0));
          window.scrollTo(0, p * (document.documentElement.scrollHeight - vh()));
        }
        handOver();
        const target = director.at(window.scrollY, vh());
        if (target) engine.setView(target.rig.view);
        return;
      }
      engine.setQuote(quoteOf(calc.get()), { animate: true });
      await wait(1700);
      if (cancelled || skipped) return;
      const hero = director.heroView();
      if (hero) await flight(hero, 4.2);
      if (cancelled || skipped) return;
      handOver();
    };

    let started = false;
    const unsubscribeBoot = boot.subscribe(() => {
      const b = boot.get();
      if (b.opened && !opened && !started) {
        started = true;
        void open();
      }
    });
    if (boot.get().opened) {
      started = true;
      void open();
    }

    // Any scroll during the opening ends it where it stands and gives the camera to the scroll.
    const skip = () => {
      if (opened || skipped || !started) return;
      skipped = true;
      engine.settle();
      handOver();
    };
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    window.addEventListener("keydown", skip);

    // Dip back to the pallet when the cargo changes on the first screen, then return.
    let urlTimer: ReturnType<typeof setTimeout> | undefined;
    let diveTimer: ReturnType<typeof setTimeout> | undefined;
    let returnTimer: ReturnType<typeof setTimeout> | undefined;
    let dropTimer: ReturnType<typeof setTimeout> | undefined;
    let lastUnits = calc.get().units;
    let lastProduct = calc.get().product;
    const dive = () => {
      if (!opened || reduced) return;
      const m = moment.get();
      if (m.chapter === 1) {
        engine.dropCartons();
        return;
      }
      if (m.chapter !== 0 || window.scrollY > 40) return;
      directing = false;
      engine.releaseRig();
      engine.flyTo(engine.viewFor("dock"), { seconds: 1.5 });
      clearTimeout(dropTimer);
      dropTimer = setTimeout(() => engine.dropCartons(), 900);
      clearTimeout(returnTimer);
      returnTimer = setTimeout(() => {
        const hero = director.heroView();
        if (!hero) {
          handOver();
          return;
        }
        engine.flyTo(hero, { seconds: 2.2, done: handOver });
      }, 2900);
    };

    const unsubscribe = calc.subscribe(() => {
      const next = calc.get();
      // Browsers ration history writes, and a dragged number changes sixty times a second.
      clearTimeout(urlTimer);
      urlTimer = setTimeout(() => {
        history.replaceState(null, "", `${location.pathname}${location.search}${encode(next)}`);
      }, 350);
      const q = quoteOf(next);
      engine.setQuote(q, { animate: opened });
      director.setQuote(q);
      const productChanged = next.product !== lastProduct;
      const unitsChanged = Math.abs(next.units - lastUnits) / lastUnits > 0.12;
      if (productChanged || unitsChanged) {
        clearTimeout(diveTimer);
        diveTimer = setTimeout(() => {
          lastUnits = calc.get().units;
          lastProduct = calc.get().product;
          dive();
        }, 650);
      }
    });

    return () => {
      cancelled = true;
      stopTick();
      unsubscribeBoot();
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("keydown", skip);
      clearTimeout(urlTimer);
      clearTimeout(diveTimer);
      clearTimeout(returnTimer);
      clearTimeout(dropTimer);
      unsubscribe();
      ro.disconnect();
      sections.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      setEngine(null);
      engine.dispose();
      if (window.__mr === engine) delete window.__mr;
      if (window.__mrDirector === director) delete window.__mrDirector;
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className="mr-canvas" aria-hidden />;
}
