"use client";

import { useEffect, useMemo, useRef } from "react";

import { PLACES, REGIONS, project } from "@/lib/marshrut/geo";
import { days, num, rub } from "@/lib/marshrut/format";
import { along } from "@/lib/marshrut/route";
import { dayAt } from "@/lib/marshrut/timeline";
import { clamp } from "@/lib/marshrut/util";
import type { Hud } from "./engine/Engine";
import { legWidth } from "./engine/routeLines";

import { useEngine } from "./engineStore";
import { moment } from "./moment";
import { useQuote } from "./store";

/**
 * The lettering on the atlas.
 *
 * City names, countries in spaced capitals, seas in italic, the two ends of
 * the route, and a tag on each leg saying what it costs and how long it
 * takes. All of it is ordinary HTML, positioned every frame from the 3D
 * camera, so it stays as sharp as the page's own text and can be hovered and
 * read by a screen reader. Nothing here is drawn in WebGL.
 *
 * Which names show depends on how far the camera is: the cities that matter
 * at the scale of a continent first, the smaller ones once the cargo is
 * being followed. While it is followed, the stations on its own line are
 * marked with the day it passes each one, and the leg tags step aside.
 */

interface Item {
  el: HTMLElement;
  kind: "place" | "region" | "origin" | "dest" | "tag";
  x: number;
  z: number;
  rank: number;
  index: number;
  /** Size of the lettering, for keeping it whole on the sheet and clear of the tags. */
  w: number;
  h: number;
  /** Tilt of the lettering, degrees. */
  angle: number;
}

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** Room kept clear at the sides of the sheet (the ruler runs there), and under the header at the top. */
const EDGE = 36;
const TOP = 96;
/** How near a city name may come to the edge of the sheet. */
const MARGIN = 16;
/** How far above and below the marker a name reaches, in each of the ways it may sit. */
const DROP = { none: [-14, 16], below: [12, 44], above: [-41, -10] } as const;
/** Air between two tags. */
const GAP = 6;
/** The order tags settle in; see the note where it is used. */
const TAG_ORDER = [0, 2, 1] as const;
/**
 * Places a tag may be moved to, as offsets from where it belongs, nearest
 * first. Up and down come cheaper than sideways, so a tag stays above or
 * below its leg when it can; each offset is tried on the side the tag prefers
 * before the mirror of it.
 */
const STEP = 6;
const REACH_X = 144;
const REACH_Y = 180;
const CANDIDATES: { dx: number; dy: number }[] = (() => {
  const out: { dx: number; dy: number; cost: number }[] = [];
  for (let ix = -REACH_X / 24; ix <= REACH_X / 24; ix++) {
    for (let iy = 0; iy <= REACH_Y / STEP; iy++) {
      const dx = ix * 24;
      const dy = iy * STEP;
      const cost = Math.hypot(dx * 1.4, dy);
      out.push({ dx, dy, cost });
      if (dy !== 0) out.push({ dx, dy: -dy, cost: cost + 0.01 });
    }
  }
  return out.sort((a, b) => a.cost - b.cost || a.dx - b.dx);
})();

const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

export function Labels() {
  const engine = useEngine();
  const q = useQuote();
  const root = useRef<HTMLDivElement>(null);

  const places = useMemo(
    () => PLACES.map((p) => ({ ...p, at: project(p.lon, p.lat) })),
    [],
  );
  const regions = useMemo(
    () => REGIONS.map((r) => ({ ...r, at: project(r.lon, r.lat) })),
    [],
  );

  useEffect(() => {
    const host = root.current;
    if (!engine || !host) return;

    const items: Item[] = [];
    host.querySelectorAll<HTMLElement>("[data-place]").forEach((el, i) => {
      const p = places[i];
      if (p) items.push({ el, kind: "place", x: p.at.x, z: p.at.z, rank: p.rank, index: i, w: 0, h: 0, angle: 0 });
    });
    host.querySelectorAll<HTMLElement>("[data-region]").forEach((el, i) => {
      const r = regions[i];
      if (r) items.push({ el, kind: "region", x: r.at.x, z: r.at.z, rank: 0, index: i, w: 0, h: 0, angle: r.angle ?? 0 });
    });
    const origin = host.querySelector<HTMLElement>("[data-origin]");
    const dest = host.querySelector<HTMLElement>("[data-dest]");
    const tags = Array.from(host.querySelectorAll<HTMLElement>("[data-tag]"));
    const stations = Array.from(host.querySelectorAll<HTMLElement>("[data-station]"));

    // Sizes are read here rather than every frame, and again whenever the
    // type changes size (a face arriving, a tag renamed, the breakpoint).
    const sizes = new Map<HTMLElement, { w: number; h: number }>();
    const measure = () => {
      for (const it of items) {
        const name = it.el.firstElementChild;
        if (name instanceof HTMLElement) {
          it.w = name.offsetWidth;
          it.h = name.offsetHeight;
        }
      }
      for (const el of tags) sizes.set(el, { w: el.offsetWidth, h: el.offsetHeight });
      for (const el of [origin, dest]) {
        if (!el) continue;
        const name = el.querySelector<HTMLElement>(".mr-end-name")?.offsetWidth ?? 0;
        const note = el.querySelector<HTMLElement>(".mr-end-note")?.offsetWidth ?? 0;
        sizes.set(el, { w: Math.max(name, note), h: 30 });
      }
    };
    measure();

    let hudNow: Hud | null = null;
    let last = -1;

    const layout = (hud: Hud) => {
      const plan = engine.routePlan;
      const atlas = hud.atlas;
      const on = atlas > 0.62 && !!plan;
      const alpha = Math.max(0, (atlas - 0.62) / 0.3);
      host.style.opacity = on ? String(Math.min(1, alpha)) : "0";
      host.style.visibility = on ? "visible" : "hidden";
      if (!on || !plan) return;

      const onSheet = (p: { visible: boolean; x: number; y: number }) =>
        p.visible && p.x > -60 && p.x < hud.width + 60 && p.y > -40 && p.y < hud.height + 40;

      const place = (
        el: HTMLElement,
        x: number,
        y: number,
        z: number,
        dx = 0,
        dy = 0,
      ) => {
        const p = engine.project(x, y, z);
        const ok = onSheet(p);
        el.style.visibility = ok ? "visible" : "hidden";
        if (ok) el.style.transform = `translate3d(${(p.x + dx).toFixed(1)}px, ${(p.y + dy).toFixed(1)}px, 0)`;
        return ok ? p : null;
      };

      // The route's own marks come first, so the city names can keep clear of them.
      const marks: { x: number; y: number }[] = [];
      // The ribbon as the screen sees it, a chain of small boxes along its
      // length, so that a tag can keep off it. A flight is drawn up in the air,
      // and a sloped ribbon reaches further sideways than the spot under the
      // tag's own foot.
      const ribbon: Box[] = [];
      let prev: { x: number; y: number; r: number } | null = null;
      for (let k = 0; k < plan.points.length; k++) {
        const pt = plan.points[k];
        if (!pt) continue;
        const at = plan.cum[k] ?? 0;
        const leg = at < plan.legs[1].s0 ? 0 : at < plan.legs[2].s0 ? 1 : 2;
        const r = legWidth(q.legs[leg]?.share ?? 0.3) / 2 + 3;
        const p = engine.project(pt.x, plan.lift[k] ?? 0, pt.z);
        const here = { x: p.x, y: p.y, r };
        if (prev && p.visible) {
          const length = Math.hypot(here.x - prev.x, here.y - prev.y);
          const n = Math.min(40, Math.max(1, Math.ceil(length / Math.max(4, r))));
          for (let j = 1; j <= n; j++) {
            const cx = prev.x + ((here.x - prev.x) * j) / n;
            const cy = prev.y + ((here.y - prev.y) * j) / n;
            if (cx < -80 || cx > hud.width + 80 || cy < -80 || cy > hud.height + 80) continue;
            const rr = prev.r + ((here.r - prev.r) * j) / n;
            ribbon.push({ x0: cx - rr, y0: cy - rr, x1: cx + rr, y1: cy + rr });
          }
        }
        prev = p.visible ? here : null;
      }

      // What the tags in turn must keep out of: each end with its name.
      const taken: Box[] = [];
      // Each end carries its name beside the marker, and the name goes where
      // the ribbon is not: the side it would usually take, then the other
      // side, then below and above.
      const side = (el: HTMLElement, p: { x: number; y: number }) => {
        const w = sizes.get(el)?.w ?? 0;
        const usual = p.x > hud.width * 0.7;
        // The ribbon starts at the marker itself; only the rest of it is in the way.
        const away = ribbon.filter((b) => Math.hypot((b.x0 + b.x1) / 2 - p.x, (b.y0 + b.y1) / 2 - p.y) > 22);
        const tries: { flip: boolean; drop: keyof typeof DROP }[] = [
          { flip: usual, drop: "none" },
          { flip: !usual, drop: "none" },
          { flip: usual, drop: "below" },
          { flip: usual, drop: "above" },
          { flip: !usual, drop: "below" },
          { flip: !usual, drop: "above" },
        ];
        let pick: { flip: boolean; drop: keyof typeof DROP; box: Box } | null = null;
        for (const t of tries) {
          const [up, down] = DROP[t.drop];
          const box: Box = t.flip
            ? { x0: p.x - 15 - w, x1: p.x + 9, y0: p.y + up, y1: p.y + down }
            : { x0: p.x - 9, x1: p.x + 15 + w, y0: p.y + up, y1: p.y + down };
          pick ??= { ...t, box };
          const inside = box.x0 >= 10 && box.x1 <= hud.width - 10 && box.y0 >= TOP - 26 && box.y1 <= hud.height - 10;
          const padded: Box = { x0: box.x0 - 3, y0: box.y0 - 3, x1: box.x1 + 3, y1: box.y1 + 3 };
          if (inside && !away.some((b) => overlaps(padded, b)) && !taken.some((b) => overlaps(box, b))) {
            pick = { ...t, box };
            break;
          }
        }
        if (!pick) return;
        el.dataset.flip = pick.flip ? "true" : "false";
        el.dataset.drop = pick.drop;
        taken.push(pick.box);
      };
      if (origin) {
        const p = place(origin, plan.origin.x, 0, plan.origin.z);
        if (p) {
          marks.push(p);
          side(origin, p);
        }
      }
      if (dest) {
        const p = place(dest, plan.dest.x, 0, plan.dest.z);
        if (p) {
          marks.push(p);
          side(dest, p);
        }
      }

      // Stations along the line, with the day the cargo passes each: only while it is being followed.
      const m = moment.get();
      const showStops = m.stops > 0.5;
      stations.forEach((el) => {
        const at = Number(el.dataset.s);
        if (!showStops || !Number.isFinite(at)) {
          el.style.visibility = "hidden";
          return;
        }
        const pt = along(plan, at);
        const p = place(el, pt.x, pt.lift, pt.z);
        if (!p) return;
        marks.push(p);
        const w = el.firstElementChild instanceof HTMLElement ? el.firstElementChild.offsetWidth : 60;
        taken.push({ x0: p.x - 8, y0: p.y - 34, x1: p.x + w + 12, y1: p.y + 8 });
      });
      const showTags = m.tags > 0.5;

      // A tag hangs above its leg (the customs one below). When a leg is short
      // on screen, a flight ending in a few kilometres of road, the tags would
      // land on one another and on the name of the warehouse; each one looks
      // for the nearest free place instead, and stays on the sheet. The main
      // leg is settled first, then the last mile, then customs: read from the
      // warehouse back, that is the order the tags stack in.
      for (const i of TAG_ORDER) {
        const el = tags[i];
        const leg = plan.legs[i];
        const size = el && sizes.get(el);
        if (!el || !leg || !size || size.w === 0 || !showTags) {
          if (el) el.style.visibility = "hidden";
          continue;
        }
        // Half way along the leg, at the height the ribbon is drawn there.
        const mid = along(plan, (leg.s0 + leg.s1) / 2);
        const anchor = engine.project(mid.x, mid.lift, mid.z);
        if (!onSheet(anchor)) {
          el.style.visibility = "hidden";
          continue;
        }
        const width = legWidth(q.legs[i]?.share ?? 0.3);
        // A tag stands on its bottom edge; the one under the ribbon is lowered by its own height.
        const home = i === 1 ? anchor.y + width / 2 + 14 + size.h : anchor.y - (width / 2 + 14);
        const x = clamp(anchor.x, EDGE + size.w / 2, Math.max(EDGE + size.w / 2, hud.width - EDGE - size.w / 2));
        // Nearest first, and on a tie the side the tag was meant to hang on.
        const prefer = i === 1 ? 1 : -1;
        // Only the ribbon within reach matters.
        const near = ribbon.filter(
          (b) =>
            b.x1 > x - size.w / 2 - REACH_X - GAP &&
            b.x0 < x + size.w / 2 + REACH_X + GAP &&
            b.y1 > home - size.h - REACH_Y - GAP &&
            b.y0 < home + REACH_Y + GAP,
        );

        let chosen: { x: number; y: number; box: Box } | null = null;
        let fallback: { x: number; y: number; box: Box } | null = null;
        for (const c of CANDIDATES) {
          const cx = x + c.dx;
          const y = home + c.dy * prefer;
          if (cx - size.w / 2 < EDGE || cx + size.w / 2 > hud.width - EDGE) continue;
          if (y - size.h < TOP || y > hud.height - EDGE) continue;
          const box: Box = {
            x0: cx - size.w / 2 - GAP / 2,
            x1: cx + size.w / 2 + GAP / 2,
            y0: y - size.h - GAP / 2,
            y1: y + GAP / 2,
          };
          fallback ??= { x: cx, y, box };
          if (!taken.some((t) => overlaps(box, t)) && !near.some((t) => overlaps(box, t))) {
            chosen = { x: cx, y, box };
            break;
          }
        }
        const at = chosen ?? fallback ?? { x, y: home, box: { x0: x, x1: x, y0: home, y1: home } };
        taken.push(at.box);
        marks.push({ x: at.x, y: at.y });
        el.style.visibility = "visible";
        el.style.transform = `translate3d(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px, 0)`;
      }

      const d = hud.d;
      for (const it of items) {
        if (it.kind === "region") {
          const shown = d > 1.4e6;
          const at = shown ? place(it.el, it.x, 0, it.z) : null;
          // Lettering half under a tag is worse than none.
          const tilt = (it.angle * Math.PI) / 180;
          const halfW = (Math.abs(it.w * Math.cos(tilt)) + Math.abs(it.h * Math.sin(tilt))) / 2;
          const halfH = (Math.abs(it.w * Math.sin(tilt)) + Math.abs(it.h * Math.cos(tilt))) / 2;
          const covered =
            !!at &&
            (at.y - halfH < TOP - 12 ||
              taken.some((t) => overlaps({ x0: at.x - halfW, y0: at.y - halfH, x1: at.x + halfW, y1: at.y + halfH }, t)));
          it.el.style.opacity = shown && !covered ? "1" : "0";
          continue;
        }
        const visible = d > 3e5 && (it.rank <= 2 || d < 4.6e6);
        const p = visible ? place(it.el, it.x, 0, it.z) : null;
        if (!p) {
          it.el.style.visibility = "hidden";
          continue;
        }
        // A name is shown whole or not at all: never cut by the edge, never under the header.
        const whole = p.x >= MARGIN && p.x + 7 + it.w <= hud.width - MARGIN && p.y >= TOP - 4 && p.y <= hud.height - MARGIN;
        const clash = marks.some((m) => Math.hypot(m.x - p.x, m.y - p.y) < 64);
        const name: Box = { x0: p.x - 6, y0: p.y - 12, x1: p.x + 11 + it.w, y1: p.y + 7 };
        const crowded = taken.some((t) => overlaps(name, t));
        it.el.style.visibility = clash || crowded || !whole ? "hidden" : "visible";
      }
    };

    const unsubscribe = engine.subscribe((hud) => {
      hudNow = hud;
      if (hud.serial === last) return;
      last = hud.serial;
      layout(hud);
    });

    // A face that arrives late, or a breakpoint that is crossed, changes what
    // the tags weigh; lay them out again even if the camera is at rest.
    const watch = new ResizeObserver(() => {
      measure();
      if (hudNow) layout(hudNow);
    });
    for (const el of tags) watch.observe(el);
    for (const it of items) if (it.el.firstElementChild) watch.observe(it.el.firstElementChild);
    for (const el of [origin, dest]) {
      el?.querySelectorAll(".mr-end-name, .mr-end-note").forEach((child) => watch.observe(child));
    }

    return () => {
      unsubscribe();
      watch.disconnect();
    };
  }, [engine, places, regions, q.legs, q.route]);

  const legs = q.legs;
  const stations = [
    ...q.route.stops.map((st) => ({ name: st.name, s: st.s, gate: false })),
    { name: q.route.gate.name, s: q.route.gate.s, gate: true },
  ].sort((a, b) => a.s - b.s);
  const hover = (i: number) => () => engine?.highlightLeg(i);
  const leave = () => engine?.highlightLeg(-1);

  return (
    <div ref={root} className="mr-labels">
      {regions.map((r) => (
        <div key={r.name} className="mr-region" data-region data-kind={r.kind} aria-hidden>
          <span style={r.angle ? { transform: `rotate(${r.angle}deg)` } : undefined}>{r.name}</span>
        </div>
      ))}
      {places.map((p) => (
        <div key={p.id} className="mr-place" data-place data-rank={p.rank} aria-hidden>
          <span>{p.name}</span>
        </div>
      ))}

      <div className="mr-end" data-origin data-end="origin">
        <span className="mr-end-name">{q.route.origin.name}</span>
        <span className="mr-end-note">склад отправки</span>
      </div>
      <div className="mr-end" data-dest data-end="dest">
        <span className="mr-end-name">{q.route.dest.name}</span>
        <span className="mr-end-note">склад маркетплейса</span>
      </div>

      {stations.map((st) => (
        <div key={`${st.name}-${st.s}`} className="mr-station" data-station data-s={st.s} data-gate={st.gate} aria-hidden>
          <span className="mr-station-name">{st.name}</span>
          <span className="mr-station-day mr-num">день {num(Math.round(dayAt(q, st.s)))}</span>
        </div>
      ))}

      {legs.map((leg, i) => (
        <button
          key={leg.id}
          type="button"
          className="mr-tag"
          data-tag
          onPointerEnter={hover(i)}
          onPointerLeave={leave}
          onFocus={hover(i)}
          onBlur={leave}
        >
          <span className="mr-tag-name">{leg.name}</span>
          <span className="mr-tag-meta mr-num">
            {rub(leg.perUnit, leg.perUnit < 10 ? 2 : 1)} · {days(leg.days.mode)}
          </span>
        </button>
      ))}
    </div>
  );
}
