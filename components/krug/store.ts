"use client";

import { useSyncExternalStore } from "react";

import type { GlazeId, StageId } from "@/lib/krug/data";
import { FIRST_CUP, type Profile } from "@/lib/krug/profile";

/**
 * The reader's cup. One shape, one glaze, carried through the page: pulled
 * on the wheel in the hero, fired in the process, pinned to the booking as
 * a sketch for the potter. Kept outside React so the WebGL loops can read
 * it every frame without re-rendering anything.
 */
export interface Cup {
  readonly profile: Profile;
  readonly glaze: GlazeId;
  /** Whether the reader has touched the clay yet; the hint goes once they have. */
  readonly touched: boolean;
}

let cup: Cup = { profile: FIRST_CUP, glaze: "celadon", touched: false };
const listeners = new Set<() => void>();

export const cupStore = {
  get: () => cup,
  set(next: Partial<Cup>) {
    cup = { ...cup, ...next };
    for (const l of listeners) l();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useCup<T>(pick: (c: Cup) => T): T {
  return useSyncExternalStore(
    cupStore.subscribe,
    () => pick(cupStore.get()),
    () => pick(cup),
  );
}

/** Which step of the process is in front of the reader, as a continuous value: 0 = throwing, 4 = fired. */
let stage = 0;
const stageListeners = new Set<() => void>();

export const stageStore = {
  get: () => stage,
  set(next: number) {
    if (next === stage) return;
    stage = next;
    for (const l of stageListeners) l();
  },
  subscribe(l: () => void) {
    stageListeners.add(l);
    return () => stageListeners.delete(l);
  },
};

export const STAGE_ORDER: readonly StageId[] = ["throw", "dry", "bisque", "glaze", "fire"];
