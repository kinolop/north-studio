"use client";

import { useSyncExternalStore } from "react";

import type { MarshrutEngine } from "./engine/Engine";

/**
 * Where the running engine is kept so the overlay layers can find it.
 *
 * The stage owns the engine's life (it creates it when the canvas mounts and
 * disposes it when the canvas goes), and the ruler, the labels and the
 * dimension lines all need to read from it every frame. They get it here,
 * and are told when it appears or goes away.
 */

let current: MarshrutEngine | null = null;
const listeners = new Set<() => void>();

export function setEngine(engine: MarshrutEngine | null) {
  current = engine;
  listeners.forEach((l) => l());
}

export function useEngine(): MarshrutEngine | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => current,
    () => null,
  );
}
