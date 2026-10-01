/**
 * Distance and time along one shipment, on the median schedule.
 *
 * The camera, the day counter in the bar, the tracking log and the
 * timetables all have to agree on which day the cargo is where, so they all
 * ask here. Each leg's typical duration is scaled so the three add up to the
 * median of the whole trip: the counter then ends on exactly the number the
 * ticket promised, not a day either side of it.
 */

import type { Quote } from "./model";
import { clamp, clamp01 } from "./util";

/** Days spent on the main haul, at the border, and on the last stretch. */
export function legDays(q: Quote): [number, number, number] {
  const raw = [q.legs[0].days.mode, q.legs[1].days.mode, q.legs[2].days.mode];
  const sum = raw[0]! + raw[1]! + raw[2]! || 1;
  const k = q.days.p50 / sum;
  return [raw[0]! * k, raw[1]! * k, raw[2]! * k];
}

/** The day the cargo reaches `s` metres along the route. */
export function dayAt(q: Quote, s: number): number {
  const d = legDays(q);
  let acc = 0;
  for (let i = 0; i < 3; i++) {
    const leg = q.route.legs[i]!;
    if (s <= leg.s1) return acc + clamp01((s - leg.s0) / Math.max(1, leg.s1 - leg.s0)) * d[i]!;
    acc += d[i]!;
  }
  return acc;
}

/** How far along the route the cargo is on `day`. */
export function sAt(q: Quote, day: number): number {
  const d = legDays(q);
  let acc = 0;
  const t = clamp(day, 0, q.days.p50);
  for (let i = 0; i < 3; i++) {
    const leg = q.route.legs[i]!;
    const span = d[i]!;
    if (t <= acc + span || i === 2) return leg.s0 + clamp01((t - acc) / Math.max(1e-6, span)) * (leg.s1 - leg.s0);
    acc += span;
  }
  return q.route.length;
}

/** Kilometres travelled by `s`, as a reader would count them on the road. */
export function kmAt(q: Quote, s: number): number {
  return (s / Math.max(1, q.route.length)) * q.route.kmTotal;
}
