/**
 * The shape of a pot, as a potter would describe it: how wide the foot is,
 * where the belly swells, where the neck pinches in and where the rim ends.
 *
 * Four control points on the outer wall, in centimetres, measured from the
 * axis of the wheel (r) and from the wheel head (y). Everything on the page
 * that draws a vessel, the turning one in WebGL and the catalogue plates in
 * SVG, samples the same curve from here, so a cup pulled in the hero is the
 * same cup that goes through the kiln further down.
 */

export interface Profile {
  /** Radius of the foot ring where it meets the wheel head. */
  readonly foot: number;
  /** The widest point of the lower body and how high it sits. */
  readonly belly: { readonly r: number; readonly y: number };
  /** The waist under the rim. */
  readonly neck: { readonly r: number; readonly y: number };
  /** The rim: its radius and the full height of the pot. */
  readonly lip: { readonly r: number; readonly y: number };
}

export type Point = readonly [r: number, y: number];

/** Wall thickness of a thrown pot in the hands of a first-timer, in cm. */
export const WALL = 0.55;
/** The floor is left thicker than the wall: it is what gets trimmed. */
export const FLOOR = 0.8;

/** The limits a beginner's lump of clay actually allows. */
export const LIMITS = {
  r: { min: 2.2, max: 9.5 },
  height: { min: 4.5, max: 22 },
} as const;

/** What the wheel starts with: a plain cup, the thing everyone makes first. */
export const FIRST_CUP: Profile = {
  foot: 3.2,
  belly: { r: 4.3, y: 2.9 },
  neck: { r: 4.0, y: 6.6 },
  lip: { r: 4.35, y: 8.6 },
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * A profile made physically sensible again after a drag: the control points
 * stay in order up the wall and inside what a pound of clay can reach.
 */
export function settle(p: Profile): Profile {
  const lipY = clamp(p.lip.y, LIMITS.height.min, LIMITS.height.max);
  const bellyY = clamp(p.belly.y, lipY * 0.14, lipY * 0.55);
  const neckY = clamp(p.neck.y, bellyY + lipY * 0.18, lipY * 0.9);
  const r = (v: number) => clamp(v, LIMITS.r.min, LIMITS.r.max);
  return {
    foot: clamp(p.foot, 2, Math.max(2.2, r(p.belly.r) * 1.05)),
    belly: { r: r(p.belly.r), y: bellyY },
    neck: { r: r(p.neck.r), y: neckY },
    lip: { r: r(p.lip.r), y: lipY },
  };
}

/** Centripetal-ish Catmull-Rom through the control points, evaluated at t in [0,1]. */
function catmull(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const t2 = t * t;
  const t3 = t2 * t;
  const f = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
}

/**
 * The outer wall from the foot to the rim, `n` points evenly spaced in the
 * curve's own parameter. The first point sits on the wheel head.
 */
export function outerWall(p: Profile, n = 48): Point[] {
  const knots: Point[] = [
    [p.foot, 0],
    [p.belly.r, p.belly.y],
    [p.neck.r, p.neck.y],
    [p.lip.r, p.lip.y],
  ];
  // Phantom ends, mirrored, so the curve leaves the foot and reaches the rim
  // without a kink.
  const first: Point = [2 * knots[0]![0] - knots[1]![0], -knots[1]![1]];
  const last: Point = [2 * knots[3]![0] - knots[2]![0], 2 * knots[3]![1] - knots[2]![1]];
  const all = [first, ...knots, last];
  const segments = knots.length - 1;
  const out: Point[] = [];
  for (let i = 0; i < n; i += 1) {
    const u = (i / (n - 1)) * segments;
    const s = Math.min(segments - 1, Math.floor(u));
    const t = u - s;
    const [r, y] = catmull(all[s]!, all[s + 1]!, all[s + 2]!, all[s + 3]!, t);
    out.push([Math.max(0.4, r), Math.max(0, y)]);
  }
  return out;
}

/**
 * The whole section of the pot as one closed line, ready to be turned:
 * up the outside, over a rounded rim, down the inside and across the floor
 * to the axis. The inside wall is the outside moved inwards along its own
 * normal, which is how a wall of even thickness actually behaves.
 */
export function section(p: Profile, n = 48): Point[] {
  const outer = outerWall(p, n);
  const inner: Point[] = [];
  for (let i = 0; i < outer.length; i += 1) {
    const a = outer[Math.max(0, i - 1)]!;
    const b = outer[Math.min(outer.length - 1, i + 1)]!;
    const dr = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dr, dy) || 1;
    // Normal pointing into the pot.
    const nr = -dy / len;
    const ny = dr / len;
    inner.push([Math.max(0.2, outer[i]![0] + nr * WALL), outer[i]![1] + ny * WALL]);
  }
  // The inside stops at the floor.
  const floorAt = FLOOR;
  const innerAbove = inner.filter(([, y]) => y >= floorAt);

  const top = outer[outer.length - 1]!;
  const topIn = innerAbove[innerAbove.length - 1] ?? [top[0] - WALL, top[1]];
  const rim: Point[] = [];
  // A half-round rim between the two walls.
  const cr = (top[0] + topIn[0]) / 2;
  const cy = (top[1] + topIn[1]) / 2;
  const rr = Math.hypot(top[0] - topIn[0], top[1] - topIn[1]) / 2;
  const a0 = Math.atan2(top[1] - cy, top[0] - cr);
  for (let k = 1; k < 8; k += 1) {
    const a = a0 + (Math.PI * k) / 8;
    rim.push([cr + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }

  const down = innerAbove.slice().reverse();
  const floorEdge = down[down.length - 1] ?? [p.foot - WALL, floorAt];
  return [
    [0.001, 0],
    ...outer,
    ...rim,
    ...down,
    [Math.max(0.001, floorEdge[0] - 0.4), floorAt],
    [0.001, floorAt],
  ];
}

/** Inner volume in millilitres: the inside of the pot turned about its axis. */
export function volumeMl(p: Profile): number {
  const outer = outerWall(p, 96);
  let v = 0;
  for (let i = 1; i < outer.length; i += 1) {
    const y0 = Math.max(FLOOR, outer[i - 1]![1]);
    const y1 = Math.max(FLOOR, outer[i]![1]);
    if (y1 <= y0) continue;
    const r0 = Math.max(0, outer[i - 1]![0] - WALL);
    const r1 = Math.max(0, outer[i]![0] - WALL);
    // Frustum.
    v += (Math.PI * (y1 - y0) * (r0 * r0 + r0 * r1 + r1 * r1)) / 3;
  }
  // cm³ are millilitres; a cup is never filled to the brim.
  return v * 0.9;
}

/** Clay it takes to throw this, in grams: wall area times thickness, plus what is trimmed off. */
export function clayGrams(p: Profile): number {
  const outer = outerWall(p, 96);
  let area = Math.PI * p.foot * p.foot;
  for (let i = 1; i < outer.length; i += 1) {
    const [r0, y0] = outer[i - 1]!;
    const [r1, y1] = outer[i]!;
    area += Math.PI * (r0 + r1) * Math.hypot(r1 - r0, y1 - y0);
  }
  // Stoneware body, about 2 g/cm³ fired, a third more thrown wet.
  return area * WALL * 2 * 1.35 + 120;
}

export function widest(p: Profile): number {
  return Math.max(...outerWall(p, 64).map(([r]) => r)) * 2;
}

/**
 * What a potter would call the thing on the wheel. Read off proportion and
 * size, roughly as a shop would label it; it is a guess, and says so by
 * being friendly rather than exact.
 */
export function vesselName(p: Profile): string {
  const h = p.lip.y;
  const w = widest(p);
  const ml = volumeMl(p);
  const ratio = h / w;
  if (p.neck.r < p.belly.r * 0.75) return h > 13 ? "ваза" : h > 9.5 ? "кувшин" : "горшочек";
  if (ratio < 0.45) return w > 15 ? "блюдо" : "пиала";
  if (ratio < 0.7) return ml > 500 ? "салатник" : "чаша";
  if (h > 15) return "ваза";
  if (ml < 140) return "чашка для эспрессо";
  if (ratio > 1.35) return "стакан";
  if (ml > 420) return "большая кружка";
  return "чашка";
}

/** Centimetres the way they are written on a kiln ticket: one decimal, Russian comma. */
export const cm = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
