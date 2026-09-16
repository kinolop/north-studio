"use client";

import { LOCALES } from "@/lib/i18n";

import { useCopy, useLocale } from "./CopyProvider";

/**
 * Two states, one control. A dropdown for a binary choice would be a click
 * more than it deserves, so both locales are always visible.
 */
export function LocaleSwitch({ className = "" }: { className?: string; tone?: "paper" }) {
  const { locale, setLocale } = useLocale();
  const copy = useCopy();

  return (
    <div
      role="group"
      aria-label={copy.studio.languageLabel}
      className={`flex items-center gap-1 ${className}`}
    >
      {LOCALES.map((option, index) => {
        const active = option === locale;
        return (
          <span key={option} className="flex items-center">
            {index > 0 && (
              <span aria-hidden className="mr-1 text-ink-mute select-none">
                /
              </span>
            )}
            <button
              type="button"
              onClick={() => setLocale(option)}
              aria-pressed={active}
              className={`px-1 py-0.5 text-small font-semibold transition-colors duration-300 ${active ? "text-ink" : "text-ink-mute hover:text-ink"}`}
            >
              {option.toUpperCase()}
            </button>
          </span>
        );
      })}
    </div>
  );
}
