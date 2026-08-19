import { en } from "./en";
import { ru } from "./ru";
import type { Copy } from "./types";

export type Locale = "en" | "ru";

/**
 * The locale a visitor gets before they express a preference.
 *
 * This single constant decides the whole site's default: `CopyProvider`
 * seeds its state from it, so every page, every case and every string
 * follows without a second switch to flip. It is also what gets server
 * rendered — see the note in `CopyProvider` about which locale search
 * engines actually see.
 */
export const DEFAULT_LOCALE: Locale = "ru";

export const DICTIONARIES: Readonly<Record<Locale, Copy>> = { en, ru };

/** Ordered for the switcher. Russian first: it is the default. */
export const LOCALES = ["ru", "en"] as const satisfies readonly Locale[];

/** Locale is remembered per session, not forever — a shared link opens in RU. */
export const LOCALE_STORAGE_KEY = "north-locale";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "ru";
}

export type { Copy } from "./types";
