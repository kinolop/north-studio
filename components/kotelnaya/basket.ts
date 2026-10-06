"use client";

import { useSyncExternalStore } from "react";

import type { BreadId } from "@/lib/kotelnaya/data";

/**
 * What the reader has asked to be set aside. Shared by the bread cards
 * ("Отложить") and the pre-order form, which can sit far apart on the page.
 */
export type Basket = Readonly<Partial<Record<BreadId, number>>>;

let basket: Basket = {};
const listeners = new Set<() => void>();
const EMPTY: Basket = {};

export const basketStore = {
  get: () => basket,
  add(id: BreadId, delta: number) {
    const next = Math.max(0, Math.min(20, (basket[id] ?? 0) + delta));
    basket = { ...basket, [id]: next };
    for (const l of listeners) l();
  },
  clear() {
    basket = {};
    for (const l of listeners) l();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useBasket(): Basket {
  return useSyncExternalStore(basketStore.subscribe, basketStore.get, () => EMPTY);
}
