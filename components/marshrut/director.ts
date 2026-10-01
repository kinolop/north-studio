import type { Quote } from "@/lib/marshrut/model";
import { MODES, type ModeId } from "@/lib/marshrut/data";
import { along, buildRoute } from "@/lib/marshrut/route";
import { legDays, sAt } from "@/lib/marshrut/timeline";
import { clamp01, lerp, seg, smooth, smoother } from "@/lib/marshrut/util";

import { CENTER_FROM_PALLET, type MarshrutEngine, type Rig } from "./engine/Engine";
import { planFlight, type Flight, type View } from "./engine/flight";
import { CHAPTERS, type Moment } from "./moment";

/**
 * The page as one camera move.
 *
 * Every chapter of the page is a place on the journey, and the director
 * turns the scroll position into what the stage should show there: the
 * whole route over the first screen, the pallet under the lamp while the
 * page talks about density, all four ways from China at once for the
 * timetable, then the cargo itself, followed across Asia day by day, held at
 * the border while its papers are checked, and brought in to the warehouse.
 *
 * Each chapter has a held part, while its panel is pinned, and between two
 * chapters there is one screen of scroll in which the camera flies from the
 * last picture of one to the first picture of the next. The flights are
 * planned once (they depend on the calculation and the window, not on the
 * scroll) and sampled, so the camera is a pure function of the scroll: the
 * same position always shows the same thing, going down or coming back up.
 */

export interface Rect {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

interface Pose {
  view: View;
  frame: { x: number; y: number };
  s: number;
  load: number;
  ahead: number;
  moving: boolean;
  alts: number;
  queue: number;
  day: number;
  stamp: number;
  ruler: number;
  tags: number;
  stops: number;
}

interface Span {
  top: number;
  height: number;
}

const FOLLOW_PITCH = 0.8;

export class Director {
  private spans: Span[] = [];
  private views = new Map<string, View>();
  private flights = new Map<number, Flight>();
  private q: Quote | null = null;

  constructor(
    private engine: MarshrutEngine,
    private heroRect: () => Rect,
  ) {}

  setQuote(q: Quote) {
    this.q = q;
    this.invalidate();
  }

  /** Forget every planned view and flight: the calculation or the window changed. */
  invalidate() {
    this.views.clear();
    this.flights.clear();
  }

  /** Reads where each chapter sits on the page. */
  measure() {
    const y = window.scrollY;
    this.spans = CHAPTERS.map((id) => {
      const el = document.getElementById(id);
      if (!el) return { top: 0, height: 0 };
      const r = el.getBoundingClientRect();
      return { top: r.top + y, height: r.height };
    });
  }

  private get wide() {
    return this.engine.size.w >= 900;
  }

  private cached(key: string, make: () => View): View {
    let v = this.views.get(key);
    if (!v) {
      v = make();
      this.views.set(key, v);
    }
    return v;
  }

  /** The route and everything that has to fit with it, as points to frame. */
  private routePoints(all: boolean) {
    const q = this.q;
    if (!q) return [];
    const plans = all
      ? MODES.map((m) => (m.id === q.input.mode ? q.route : buildRoute(q.input.origin, m.id as ModeId, q.input.dest)))
      : [q.route];
    const out: { x: number; y: number; z: number }[] = [];
    for (const plan of plans) {
      const step = Math.max(1, Math.floor(plan.points.length / 160));
      for (let i = 0; i < plan.points.length; i += step) {
        const p = plan.points[i]!;
        out.push({ x: p.x, y: all ? 0 : plan.lift[i] ?? 0, z: p.z });
      }
    }
    return out;
  }

  private follow(s: number, d: number, yawShift = 0): View {
    const q = this.q!;
    const p = along(q.route, s);
    const frac = s / Math.max(1, q.route.length);
    return { x: p.x, y: p.lift, z: p.z, d, pitch: FOLLOW_PITCH, yaw: -0.46 + 0.3 * frac + yawShift };
  }

  /** Pixels the subject is pushed by, so it stands clear of the chapter's panel. */
  private side(share: number): { x: number; y: number } {
    const { w, h } = this.engine.size;
    return this.wide ? { x: w * share, y: 0 } : { x: 0, y: -h * 0.19 };
  }

  private pose(i: number, t: number): Pose {
    const q = this.q!;
    const route = q.route;
    const [d0, d1, d2] = legDays(q);
    const followD = this.wide ? 3.3e6 : 4e6;
    const base: Pose = {
      view: this.engine.current,
      frame: { x: 0, y: 0 },
      s: CENTER_FROM_PALLET,
      load: 0,
      ahead: 1,
      moving: false,
      alts: 0,
      queue: 0,
      day: 0,
      stamp: 0,
      ruler: 0,
      tags: 0,
      stops: 0,
    };

    switch (CHAPTERS[i]) {
      case "top":
        return {
          ...base,
          view: this.cached("hero", () => this.engine.viewFor("route", this.heroRect)),
          ruler: 1,
          tags: 0,
        };

      case "density": {
        const dock = this.cached("dock", () => this.engine.viewFor("dock"));
        return {
          ...base,
          view: { ...dock, yaw: dock.yaw + lerp(-0.22, 0.38, smooth(t)), d: dock.d * lerp(1.06, 0.9, smooth(t)) },
          frame: this.side(0.13),
          ruler: 1,
        };
      }

      case "modes": {
        const rect: Rect = this.wide
          ? { x0: -0.04, x1: 0.93, y0: -0.8, y1: 0.74 }
          : { x0: -0.9, x1: 0.9, y0: 0.16, y1: 0.8 };
        return {
          ...base,
          view: this.cached(`all:${this.wide}`, () => this.engine.fit(this.routePoints(true), rect, { pitch: 0.92, yaw: -0.3 })),
          load: 1,
          alts: 1,
        };
      }

      case "tracking": {
        const day = lerp(0, d0, t);
        const s = Math.max(CENTER_FROM_PALLET, sAt(q, day));
        return {
          ...base,
          view: this.follow(s, followD),
          frame: this.side(0.2),
          s,
          load: 1,
          ahead: 0.32,
          moving: s > CENTER_FROM_PALLET + 800,
          day,
          stops: 1,
        };
      }

      case "docs": {
        const day = d0 + d1 * t;
        const s = sAt(q, day);
        return {
          ...base,
          view: this.follow(s, lerp(1.9e6, 9e5, smoother(t)) * (this.wide ? 1 : 1.3), 0.12 * t),
          frame: this.side(0.23),
          s,
          load: 1,
          ahead: 0.32,
          moving: true,
          day,
          queue: 1,
          stamp: seg(t, 0.84, 0.9),
        };
      }

      case "faq": {
        const day = d0 + d1 + d2 * t;
        const s = sAt(q, day);
        return {
          ...base,
          view: this.follow(s, followD),
          frame: this.side(0.2),
          s,
          load: 1,
          ahead: 0.32,
          moving: true,
          day,
          stops: 1,
        };
      }

      default: {
        const rect: Rect = this.wide
          ? { x0: 0.02, x1: 0.92, y0: -0.72, y1: 0.76 }
          : { x0: -0.9, x1: 0.9, y0: 0.18, y1: 0.8 };
        return {
          ...base,
          view: this.cached(`arrive:${this.wide}`, () => this.engine.fit(this.routePoints(false), rect, { pitch: 0.9, yaw: -0.22 })),
          s: route.length,
          load: 1,
          ahead: 1,
          moving: true,
          day: q.days.p50,
          tags: 1,
        };
      }
    }
  }

  private flight(i: number, a: View, b: View): Flight {
    let f = this.flights.get(i);
    if (!f) {
      f = planFlight(a, b);
      this.flights.set(i, f);
    }
    return f;
  }

  /** The picture for a scroll position, and the moment it stands for. */
  at(scrollY: number, vh: number): { rig: Rig; moment: Moment } | null {
    const q = this.q;
    const spans = this.spans;
    if (!q || spans.length !== CHAPTERS.length) return null;

    const n = spans.length;
    let pose: Pose | null = null;
    let chapter = 0;
    let local = 0;

    for (let i = 0; i < n; i++) {
      const sp = spans[i]!;
      const next = spans[i + 1];
      const holdEnd = next ? Math.max(sp.top, next.top - vh) : sp.top + Math.max(0, sp.height - vh);
      if (scrollY < holdEnd || !next) {
        const range = holdEnd - sp.top;
        local = range > 1 ? clamp01((scrollY - sp.top) / range) : scrollY < sp.top ? 0 : 1;
        chapter = i;
        pose = this.pose(i, local);
        break;
      }
      if (scrollY < next.top) {
        const u = clamp01((scrollY - holdEnd) / Math.max(1, next.top - holdEnd));
        const a = this.pose(i, 1);
        const b = this.pose(i + 1, 0);
        const e = smoother(u);
        const view = this.flight(i, a.view, b.view).at(u);
        const mix = (x: number, y: number) => lerp(x, y, e);
        // Out of the pallet's chapter the pallet goes into the truck while the camera is still near.
        const load = CHAPTERS[i] === "density" ? smoother(seg(u, 0.02, 0.5)) : mix(a.load, b.load);
        pose = {
          view,
          frame: { x: mix(a.frame.x, b.frame.x), y: mix(a.frame.y, b.frame.y) },
          s: mix(a.s, b.s),
          load,
          ahead: mix(a.ahead, b.ahead),
          moving: e > 0.5 ? b.moving : a.moving,
          alts: mix(a.alts, b.alts),
          queue: mix(a.queue, b.queue),
          day: mix(a.day, b.day),
          stamp: mix(a.stamp, b.stamp),
          ruler: mix(a.ruler, b.ruler),
          tags: mix(a.tags, b.tags),
          stops: mix(a.stops, b.stops),
        };
        chapter = u < 0.5 ? i : i + 1;
        local = u < 0.5 ? 1 : 0;
        break;
      }
    }
    if (!pose) return null;

    const last = spans[n - 1]!;
    const pageEnd = Math.max(1, last.top + last.height - vh);
    return {
      rig: {
        view: pose.view,
        frame: pose.frame,
        s: pose.s,
        load: pose.load,
        ahead: pose.ahead,
        moving: pose.moving,
        alts: pose.alts,
        queue: pose.queue,
      },
      moment: {
        chapter,
        local,
        day: pose.day,
        s: pose.s,
        frac: pose.s / Math.max(1, q.route.length),
        stamp: pose.stamp,
        ruler: pose.ruler,
        tags: pose.tags,
        stops: pose.stops,
        page: clamp01(scrollY / pageEnd),
      },
    };
  }

  /** The picture of the first screen, for the opening to land on. */
  heroView(): View | null {
    if (!this.q) return null;
    return this.pose(0, 0).view;
  }
}

