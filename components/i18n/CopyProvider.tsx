"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_LOCALE,
  DICTIONARIES,
  LOCALE_STORAGE_KEY,
  isLocale,
  type Copy,
  type Locale,
} from "@/lib/i18n";

interface CopyContextValue {
  locale: Locale;
  copy: Copy;
  setLocale: (next: Locale) => void;
}

const CopyContext = createContext<CopyContextValue | null>(null);

/**
 * Locale lives in React state rather than in the URL.
 *
 * The site is one page, and the requirement is an instant switch with no
 * reload flash. Locale routing (`/ru`) would navigate on every toggle. The
 * trade-off is that Russian is not server-rendered, so it is not indexed —
 * documented in the README along with how to move to `/ru` segments if
 * Russian search traffic ever matters more than the switch feeling instant.
 *
 * The first paint is always the default locale, which keeps the server and
 * client markup identical; a stored preference is applied in an effect,
 * after hydration.
 */
export function CopyProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored) && stored !== DEFAULT_LOCALE) setLocaleState(stored);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.documentElement.lang = next;
    try {
      window.sessionStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Private browsing can refuse storage; the switch still works, it
      // just won't be remembered.
    }
  }, []);

  // Keeps the <html lang> honest for screen readers after a restore.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<CopyContextValue>(
    () => ({ locale, copy: DICTIONARIES[locale], setLocale }),
    [locale, setLocale],
  );

  return <CopyContext.Provider value={value}>{children}</CopyContext.Provider>;
}

function useCopyContext(): CopyContextValue {
  const context = useContext(CopyContext);
  if (!context) {
    throw new Error("useCopy must be used inside <CopyProvider>");
  }
  return context;
}

/** Every string on the site, in the active locale. */
export function useCopy(): Copy {
  return useCopyContext().copy;
}

/** For the switcher and for anything that formats by language. */
export function useLocale() {
  const { locale, setLocale } = useCopyContext();
  return { locale, setLocale };
}
