"use client";

import { useCopy } from "@/components/i18n/CopyProvider";

/**
 * The features, passing through.
 *
 * The track carries the list twice and travels exactly half its own width,
 * so the loop closes seamlessly without measuring anything. One animated
 * element, transform only, and a mask at both ends so the strip fades out
 * rather than being cut off.
 */
export function OrbitaTicker() {
  const copy = useCopy();
  const items = copy.orbitaCase.ticker;

  return (
    <section
      className="o-band-white"
      style={{ borderBlock: "1px solid var(--o-line)" }}
      aria-hidden
    >
      <div className="o-ticker py-5">
        <div className="o-ticker-track">
          {[0, 1].map((pass) => (
            <div key={pass} className="flex shrink-0 items-center">
              {items.map((item) => (
                <span key={item} className="flex items-center">
                  <span
                    className="px-5 text-[0.95rem] font-medium whitespace-nowrap"
                    style={{ color: "var(--o-ink)" }}
                  >
                    {item}
                  </span>
                  <span
                    className="text-[0.8rem]"
                    style={{ color: "var(--o-accent)" }}
                  >
                    ✦
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
