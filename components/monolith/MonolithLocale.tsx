"use client";

import { useCopy, useLocale } from "@/components/i18n/CopyProvider";
import { LOCALES } from "@/lib/i18n";

/**
 * RU / EN, in the practice's own hand.
 *
 * The state is carried by the press rather than by a colour or a pill: the
 * language you are not reading is cut into the wall, the one you are reading
 * is written on it. It costs nothing, it needs no border on a page that has
 * none, and it is the only control here that has to say anything about
 * itself.
 *
 * It appears twice — over the hero and on the contact slab. The page carries
 * no fixed bar, because a strip of chrome floating over concrete would be
 * the only thing on the page that is not part of the wall, so instead the
 * switch sits at both ends of the descent.
 */
export function MonolithLocale() {
  const copy = useCopy();
  const { locale, setLocale } = useLocale();

  return (
    <div
      role="group"
      aria-label={copy.studio.languageLabel}
      className="flex items-center gap-3"
    >
      {LOCALES.map((option, index) => (
        <span key={option} className="flex items-center gap-3">
          {index > 0 && (
            <span aria-hidden className="mn-mono mn-deboss-fine select-none">
              /
            </span>
          )}
          <button
            type="button"
            onClick={() => setLocale(option)}
            aria-pressed={option === locale}
            className="mn-locale-btn mn-mono"
          >
            {option.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
