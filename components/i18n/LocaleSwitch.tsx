"use client";

import { LOCALES } from "@/lib/i18n";

import { useCopy, useLocale } from "./CopyProvider";

/**
 * Two states, one control. A dropdown for a binary choice would be a click
 * more than it deserves, so both locales are always visible and the active
 * one carries the accent — the same treatment as the active nav item.
 */
export function LocaleSwitch({ className = "" }: { className?: string }) {
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
              <span aria-hidden className="mr-1 text-hairline select-none">
                /
              </span>
            )}
            <button
              type="button"
              onClick={() => setLocale(option)}
              aria-pressed={active}
              className={[
                "label-mono rounded-[2px] px-1 py-0.5 transition-colors duration-[var(--duration-state)] ease-[var(--ease-north)]",
                active ? "text-signal-lift" : "text-slate hover:text-ash",
              ].join(" ")}
            >
              {option.toUpperCase()}
            </button>
          </span>
        );
      })}
    </div>
  );
}
