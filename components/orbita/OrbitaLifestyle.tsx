"use client";

import { useRef } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";

import { ORBITA_ASSETS } from "./OrbitaHero";
import { OrbitaImage } from "./OrbitaImage";
import { OrbitaMesh } from "./OrbitaMesh";
import { OrbitaReveal } from "./OrbitaReveal";
import { useOrbitaParallax } from "./useOrbitaParallax";

/**
 * The human moment.
 *
 * The photograph floats on the mesh with its own shadow and a few pixels of
 * parallax — it used to be half of a bordered card, which made the warmest
 * moment on the page look like a database row. The line sits beside it
 * rather than over it: text on a photograph is a legibility gamble that
 * depends entirely on what gets dropped in.
 */
export function OrbitaLifestyle() {
  const copy = useCopy();
  const orbita = copy.orbitaCase;
  const lifestyle = orbita.lifestyle;

  const photoRef = useRef<HTMLDivElement>(null);
  useOrbitaParallax(photoRef, 20);

  return (
    <section className="o-has-bg">
      <OrbitaMesh tone="calm" seed={4} />

      <div className="o-wrap o-section o-rel grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <OrbitaReveal className="lg:col-span-7">
          <div ref={photoRef} className="o-float">
            <OrbitaImage
              src={`${ORBITA_ASSETS}/lifestyle.png`}
              alt=""
              label={orbita.slots.lifestyle}
              ratio="16 / 9"
            />
          </div>
        </OrbitaReveal>

        <OrbitaReveal delay={100} className="lg:col-span-4 lg:col-start-9">
          <h2 className="o-h2 max-w-[15ch]">{lifestyle.line}</h2>
          <p className="o-lead mt-5 max-w-[32ch]">{lifestyle.note}</p>
        </OrbitaReveal>
      </div>
    </section>
  );
}
