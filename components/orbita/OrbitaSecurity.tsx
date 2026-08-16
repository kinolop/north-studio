"use client";

import { useCopy } from "@/components/i18n/CopyProvider";

import { OrbitaBackdrop } from "./OrbitaBackdrop";
import { ORBITA_ASSETS } from "./OrbitaHero";
import { OrbitaImage } from "./OrbitaImage";
import { OrbitaReveal } from "./OrbitaReveal";

/**
 * The section that has to feel bank-grade.
 *
 * The visual leads at full width above the three points rather than
 * fighting them for a column: a security promise is read, not skimmed, and
 * the picture's job is to set the tone before the words arrive.
 */
export function OrbitaSecurity() {
  const copy = useCopy();
  const orbita = copy.orbitaCase;
  const security = orbita.security;

  return (
    <section id="security" className="o-has-bg">
      <OrbitaBackdrop
        src={`${ORBITA_ASSETS}/bg-band.png`}
        scrim="veil"
        strength={26}
      />

      <div className="o-wrap o-section o-rel">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-16">
          <OrbitaReveal className="lg:col-span-6">
            <p className="o-label">{security.eyebrow}</p>
            <h2 className="o-h2 mt-4 max-w-[16ch]">{security.title}</h2>
          </OrbitaReveal>

          <OrbitaReveal delay={80} className="lg:col-span-5 lg:col-start-8">
            <p className="o-lead max-w-[44ch]">{security.body}</p>
          </OrbitaReveal>
        </div>

        <OrbitaReveal delay={60}>
          <div className="o-shot mt-14 overflow-hidden">
            <OrbitaImage
              src={`${ORBITA_ASSETS}/feature-security.png`}
              alt={security.title}
              label={orbita.slots.security}
              ratio="16 / 9"
              drift
            />
          </div>
        </OrbitaReveal>

        <ul className="mt-6 grid gap-6 lg:grid-cols-3">
          {security.items.map((item, index) => (
            <OrbitaReveal key={item.key} delay={index * 90} className="h-full">
              <li className="o-card o-lift o-sweep h-full p-7">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="var(--o-accent-deep)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3.2l6.4 2.6v5.1c0 4-2.7 7.3-6.4 8.6-3.7-1.3-6.4-4.6-6.4-8.6V5.8L12 3.2z" />
                  <path d="M9.3 11.9l1.9 1.9 3.6-3.7" />
                </svg>
                <h3 className="o-h3 mt-5">{item.title}</h3>
                <p className="o-small mt-3">{item.body}</p>
              </li>
            </OrbitaReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
