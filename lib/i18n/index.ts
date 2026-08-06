import { en } from "./en";
import { ru } from "./ru";
import type { Copy } from "./types";

export type Locale = "en" | "ru";

export const DEFAULT_LOCALE: Locale = "en";

export const DICTIONARIES: Readonly<Record<Locale, Copy>> = { en, ru };

/** Ordered for the switcher. English first: it is the default. */
export const LOCALES = ["en", "ru"] as const satisfies readonly Locale[];

/** Locale is remembered per session, not forever — a shared link opens in EN. */
export const LOCALE_STORAGE_KEY = "north-locale";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "ru";
}

export type { Copy } from "./types";
