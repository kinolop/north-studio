"use client";

import { useCopy } from "@/components/i18n/CopyProvider";

import { ORBITA_ASSETS } from "./OrbitaHero";
import { OrbitaImage } from "./OrbitaImage";
import { OrbitaReveal } from "./OrbitaReveal";

/**
 * The human moment.
 *
 * The line sits beside the photograph rather than over it: text on top of a
 * real photo is a legibility gamble that depends on whatever the founder
 * drops in, and this page does not need to take it.
 */
export function OrbitaLifestyle() {
  const copy = useCopy();
  const orbita = copy.orbitaCase;
  const lifestyle = orbita.lifestyle;

  return (
    <section className="o-band-white">
      <div className="o-wrap o-section">
        <OrbitaReveal>
          <div className="o-shot grid overflow-hidden lg:grid-cols-12">
            <div className="lg:col-span-7">
              <OrbitaImage
                src={`${ORBITA_ASSETS}/lifestyle.png`}
                alt=""
                label={orbita.slots.lifestyle}
                ratio="16 / 9"
                drift
                className="h-full"
              />
            </div>

            <div className="flex flex-col justify-center gap-4 p-9 lg:col-span-5 lg:p-14">
              <h2 className="o-h2 max-w-[16ch]">{lifestyle.line}</h2>
              <p className="o-lead max-w-[34ch]">{lifestyle.note}</p>
            </div>
          </div>
        </OrbitaReveal>
      </div>
    </section>
  );
}
