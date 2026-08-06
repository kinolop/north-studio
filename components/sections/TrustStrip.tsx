"use client";

import { useCopy } from "@/components/i18n/CopyProvider";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Task L — the seriousness marker, honestly.
 *
 * Deliberately qualitative. Every item here restates something the page
 * already proves elsewhere; none of it asserts a count, a percentage, a
 * client name or a year of trading, because none of those are known. A
 * fabricated "47 projects delivered" would do more damage on the day a
 * prospect asks about it than it ever does in the seconds it is read.
 *
 * WHEN REAL NUMBERS EXIST: keep the same four-cell rhythm and swap each
 * label for a figure plus its caption (e.g. "18" / "projects shipped").
 * Client logos belong here too — one row, monochrome, at ~40% opacity so
 * they read as evidence rather than as decoration.
 */
export function TrustStrip() {
  const copy = useCopy();

  return (
    <div className="container-north">
      <Reveal>
        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-plate)] border border-hairline bg-hairline lg:grid-cols-4">
          {copy.trust.items.map((item) => (
            <li
              key={item}
              className="group flex items-center gap-3 bg-void px-6 py-7 transition-colors duration-[var(--duration-state)] ease-[var(--ease-north)] hover:bg-abyss"
            >
              <span
                aria-hidden
                className="h-1 w-1 shrink-0 rounded-full bg-signal/70 transition-[background-color,box-shadow] duration-[var(--duration-state)] group-hover:bg-signal group-hover:shadow-[0_0_10px_2px_rgb(109_92_255/0.5)]"
              />
              <span className="text-meta text-ash transition-colors duration-[var(--duration-state)] group-hover:text-bone">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}
