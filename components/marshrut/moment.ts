"use client";

import { useSyncExternalStore } from "react";

/**
 * Where the journey is right now, for everything on the page that is not
 * the 3D stage: the day counter in the bar, the tracking log, the stamp on
 * the waybill, which chapter the header marks.
 *
 * The director writes it once a frame. Parts of the page that change every
 * frame (the counter's digits, the marker on the rail) subscribe and write
 * to the DOM themselves; parts that change in steps (a log line appearing,
 * a checklist ticking) read it through `useMoment` with a selector that
 * rounds, so React renders only when the rounded value moves.
 */

export interface Moment {
  /** The chapter that holds the screen, as an index into CHAPTERS. */
  chapter: number;
  /** 0..1 through that chapter's held part. */
  local: number;
  /** Days since pick-up, on the median schedule. */
  day: number;
  /** Metres along the route, and the same as a share of it. */
  s: number;
  frac: number;
  /** 0..1: the customs stamp, the ruler frame, the leg tags, the station names. */
  stamp: number;
  ruler: number;
  tags: number;
  stops: number;
  /** 0..1 through the whole page. */
  page: number;
}

export const CHAPTERS = ["top", "density", "modes", "tracking", "docs", "faq", "request"] as const;
export type ChapterId = (typeof CHAPTERS)[number];

let state: Moment = {
  chapter: 0,
  local: 0,
  day: 0,
  s: 0,
  frac: 0,
  stamp: 0,
  ruler: 1,
  tags: 1,
  stops: 0,
  page: 0,
};
const listeners = new Set<(m: Moment) => void>();

export const moment = {
  get: () => state,
  set(next: Moment) {
    state = next;
    listeners.forEach((l) => l(next));
  },
  subscribe(listener: (m: Moment) => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/** A value derived from the moment; the component renders only when it changes. */
export function useMoment<T extends string | number | boolean>(select: (m: Moment) => T, fallback: T): T {
  return useSyncExternalStore(
    (listener) => moment.subscribe(listener),
    () => select(state),
    () => fallback,
  );
}
