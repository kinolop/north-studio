"use client";

import { useEffect, useRef } from "react";

import { Dims } from "./Dims";
import { Stamp } from "./Journey";
import { Labels } from "./Labels";
import { moment } from "./moment";
import { Ruler } from "./Ruler";
import { Stage } from "./Stage";

/**
 * Everything behind the page: the stage and the ink laid over it.
 *
 * Fixed to the window, under every chapter. Layers, bottom to top: the WebGL
 * picture; a vignette; the veil that clears ground for the first screen's
 * words; the lettering on the map and the pallet's dimension lines; the
 * customs stamp; the ruler frame. What the director says about the moment
 * (is the ruler up, are the leg tags or the station names showing) arrives
 * here as custom properties, so CSS fades each layer without a render.
 */
export function World() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let last = "";
    return moment.subscribe((m) => {
      const veil = 1 - window.scrollY / (window.innerHeight * 0.55);
      const key = `${m.ruler.toFixed(2)}|${m.tags.toFixed(2)}|${m.stops.toFixed(2)}|${veil.toFixed(2)}`;
      if (key === last) return;
      last = key;
      el.style.setProperty("--ruler", m.ruler.toFixed(3));
      el.style.setProperty("--tags", m.tags.toFixed(3));
      el.style.setProperty("--stops", m.stops.toFixed(3));
      el.style.setProperty("--veil", Math.max(0, veil).toFixed(3));
      el.dataset.tags = m.tags > 0.5 ? "on" : "off";
      el.dataset.scrim = m.chapter > 0 ? "on" : "off";
      el.dataset.stops = m.stops > 0.5 ? "on" : "off";
    });
  }, []);

  return (
    <div ref={root} className="mr-world" data-tags="on" data-stops="off">
      <Stage />
      <div className="mr-vignette" aria-hidden />
      <div className="mr-veil" aria-hidden />
      <Labels />
      <Dims />
      <Stamp />
      <div className="mr-scrim" aria-hidden />
      <div className="mr-ruler-wrap" aria-hidden>
        <Ruler />
      </div>
    </div>
  );
}
