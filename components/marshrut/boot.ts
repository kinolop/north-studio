"use client";

import { useSyncExternalStore } from "react";

/**
 * What the loader waits for, and what it tells the stage when it is done.
 *
 * Progress is real: the faces arriving, the stage created, the map's
 * distance field built, every shader compiled. The loader shows it on the
 * seal of the container doors and opens them when it reaches the end; the
 * moment the doors start to swing, the stage begins its opening.
 */

export interface Boot {
  /** 0..1, what has actually been done. */
  progress: number;
  /** Everything the first frame needs is in place. */
  ready: boolean;
  /** The doors have started to open: the stage may begin its opening. */
  opened: boolean;
  /** The loader is gone. */
  done: boolean;
}

let state: Boot = { progress: 0, ready: false, opened: false, done: false };
const listeners = new Set<() => void>();
const parts = new Map<string, number>();

const WEIGHTS: Record<string, number> = { fonts: 0.2, engine: 0.15, map: 0.45, shaders: 0.2 };

function emit(next: Partial<Boot>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export const boot = {
  get: () => state,
  /** Marks a named part of the work as `share` (0..1) done. */
  step(name: keyof typeof WEIGHTS, share = 1) {
    parts.set(name, Math.max(parts.get(name) ?? 0, share));
    let p = 0;
    for (const [k, w] of Object.entries(WEIGHTS)) p += (parts.get(k) ?? 0) * w;
    emit({ progress: Math.min(1, p) });
  },
  ready() {
    emit({ progress: 1, ready: true });
  },
  open() {
    if (!state.opened) emit({ opened: true });
  },
  done() {
    emit({ opened: true, done: true });
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  /** For a page that is mounted again (a client navigation back to it). */
  reset() {
    parts.clear();
    state = { progress: 0, ready: false, opened: false, done: false };
  },
};

export function useBoot(): Boot {
  return useSyncExternalStore(boot.subscribe, boot.get, () => state);
}
