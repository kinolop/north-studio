"use client";

import { useSyncExternalStore } from "react";

import { DEFAULT_INPUT, quote, type Input, type Quote } from "@/lib/marshrut/model";

/**
 * The one calculation on the page.
 *
 * The sentence at the top, the 3D scene, the consignment note, the density
 * diagram and the request form all read this same input and the same
 * quote derived from it. A tiny external store rather than context: the
 * scene subscribes imperatively and has to hear about every change without
 * a React render in between.
 */

let state: Input = DEFAULT_INPUT;
const listeners = new Set<() => void>();

const quotes = new WeakMap<Input, Quote>();

/** The quote for an input, computed once per distinct input object. */
export function quoteOf(input: Input): Quote {
  let q = quotes.get(input);
  if (!q) {
    q = quote(input);
    quotes.set(input, q);
  }
  return q;
}

export const calc = {
  get: () => state,
  set(partial: Partial<Input>) {
    state = { ...state, ...partial };
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useInput(): Input {
  return useSyncExternalStore(calc.subscribe, calc.get, () => DEFAULT_INPUT);
}

export function useQuote(): Quote {
  return quoteOf(useInput());
}
