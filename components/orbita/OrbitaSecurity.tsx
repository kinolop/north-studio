"use client";

import { useCopy } from "@/components/i18n/CopyProvider";

import { ORBITA_ASSETS } from "./OrbitaHero";
import { OrbitaImage } from "./OrbitaImage";
import { OrbitaReveal } from "./OrbitaReveal";

export function OrbitaSecurity() {
  const copy = useCopy();
  const orbita = copy.orbitaCase;
  const security = orbita.security;

  return (
    <section id="security" className="o-band-tint">
      <div className="o-wrap o-section grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <OrbitaReveal className="lg:col-span-6">
          <div className="o-shot overflow-hidden">
            <OrbitaImage
              src={`${ORBITA_ASSETS}/feature-security.png`}
              alt={security.title}
              label={orbita.slots.security}
              ratio="16 / 9"
            />
          </div>
        </OrbitaReveal>

        <div className="lg:col-span-6">
          <OrbitaReveal>
            <p className="o-label">{security.eyebrow}</p>
            <h2 className="o-h2 mt-4">{security.title}</h2>
            <p className="o-lead mt-5 max-w-[44ch]">{security.body}</p>
          </OrbitaReveal>

          <ul className="mt-10 space-y-4">
            {security.items.map((item, index) => (
              <OrbitaReveal key={item.key} delay={index * 70}>
                <li className="o-card p-6">
                  <h3 className="o-h3">{item.title}</h3>
                  <p className="mt-2.5 max-w-[52ch]">{item.body}</p>
                </li>
              </OrbitaReveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
