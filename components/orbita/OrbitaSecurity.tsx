"use client";

import { useCopy } from "@/components/i18n/CopyProvider";

import { ORBITA_ASSETS } from "./OrbitaHero";
import { OrbitaImage } from "./OrbitaImage";
import { OrbitaMesh } from "./OrbitaMesh";
import { OrbitaReveal } from "./OrbitaReveal";

/**
 * The section that has to feel bank-grade.
 *
 * The shield used to be a large photograph dropped into a bordered card,
 * which is the cheapest look on any product page. Now it is small, has no
 * box at all, floats on the mint mesh with its own glow behind it, and
 * breathes on a slow nine-second cycle. The three promises sit beside it as
 * plain type, arriving one after another — because a security claim is read
 * rather than looked at.
 */
export function OrbitaSecurity() {
  const copy = useCopy();
  const orbita = copy.orbitaCase;
  const security = orbita.security;

  return (
    <section id="security" className="o-has-bg">
      <OrbitaMesh tone="tint" />

      <div className="o-wrap o-section o-rel grid items-center gap-16 lg:grid-cols-12">
        <OrbitaReveal className="lg:col-span-5">
          <div className="relative mx-auto max-w-[19rem]">
            <span aria-hidden className="o-glow" />
            <div className="o-breathe relative">
              <OrbitaImage
                src={`${ORBITA_ASSETS}/feature-security.png`}
                alt=""
                label={orbita.slots.security}
                ratio="1 / 1"
                className="rounded-[24px]"
              />
            </div>
          </div>
        </OrbitaReveal>

        <div className="lg:col-span-6 lg:col-start-7">
          <OrbitaReveal>
            <p className="o-label">{security.eyebrow}</p>
            <h2 className="o-h2 mt-4 max-w-[15ch]">{security.title}</h2>
            <p className="o-lead mt-5 max-w-[44ch]">{security.body}</p>
          </OrbitaReveal>

          <ul className="mt-10 space-y-8">
            {security.items.map((item, index) => (
              <OrbitaReveal key={item.key} delay={index * 110}>
                <li className="flex gap-4">
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="mt-1 h-[22px] w-[22px] shrink-0"
                    fill="none"
                    stroke="var(--o-accent-deep)"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3.2l6.4 2.6v5.1c0 4-2.7 7.3-6.4 8.6-3.7-1.3-6.4-4.6-6.4-8.6V5.8L12 3.2z" />
                    <path d="M9.3 11.9l1.9 1.9 3.6-3.7" />
                  </svg>
                  <span>
                    <h3 className="o-h3">{item.title}</h3>
                    <p className="mt-2 max-w-[48ch]">{item.body}</p>
                  </span>
                </li>
              </OrbitaReveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
