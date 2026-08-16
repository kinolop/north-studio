"use client";

import { useCopy } from "@/components/i18n/CopyProvider";

import { OrbitaBackdrop } from "./OrbitaBackdrop";
import { ORBITA_ASSETS } from "./OrbitaHero";
import { OrbitaImage } from "./OrbitaImage";
import { OrbitaReveal } from "./OrbitaReveal";

/** App screen per feature, in the order the dictionary lists them. */
const SHOT: Record<string, string> = {
  unify: "app-hero.png",
  transfer: "app-transfer.png",
  insights: "app-insights.png",
};

/**
 * Three feature rows, alternating sides, each screen in a soft device
 * frame. Bands alternate white and the neutral so the page breathes
 * without ever animating its own background.
 */
export function OrbitaFeatures() {
  const copy = useCopy();
  const orbita = copy.orbitaCase;
  const features = orbita.features;

  const slotFor = (key: string) =>
    key === "unify"
      ? orbita.slots.appHero
      : key === "transfer"
        ? orbita.slots.appTransfer
        : orbita.slots.appInsights;

  return (
    <section id="product">
      <div className="o-band-white">
        <div className="o-wrap pt-20 pb-4 text-center lg:pt-28">
          <OrbitaReveal>
            <p className="o-label">{features.eyebrow}</p>
            <h2 className="o-h2 mx-auto mt-4 max-w-[18ch]">{features.title}</h2>
          </OrbitaReveal>
        </div>
      </div>

      {/* Rich, clean, rich: the banded rows carry the supplied artwork and
          the one between them stays plain white so the page breathes. */}
      {features.items.map((item, index) => {
        const flipped = index % 2 === 1;
        const banded = index % 2 === 0;

        return (
          <div
            key={item.key}
            className={banded ? "o-has-bg" : "o-band-white"}
          >
            {banded && (
              <OrbitaBackdrop
                src={`${ORBITA_ASSETS}/bg-band.png`}
                scrim="veil"
                strength={22}
              />
            )}

            <div className="o-wrap o-section o-rel grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
              <OrbitaReveal
                className={`lg:col-span-6 ${flipped ? "lg:order-2 lg:col-start-7" : ""}`}
              >
                {/* A floating UI card rather than a phone bezel: the
                    screens supplied are 16:9, and a portrait frame would
                    crop three quarters of each one away. */}
                <div className="o-shot overflow-hidden">
                  <OrbitaImage
                    src={`${ORBITA_ASSETS}/${SHOT[item.key]}`}
                    alt={item.title}
                    label={slotFor(item.key)}
                    ratio="16 / 9"
                  />
                </div>
              </OrbitaReveal>

              <OrbitaReveal
                delay={80}
                className={`lg:col-span-5 ${flipped ? "lg:order-1 lg:col-start-1" : "lg:col-start-8"}`}
              >
                <p className="o-label">{item.eyebrow}</p>
                <h3 className="o-h2 mt-4">{item.title}</h3>
                <p className="o-lead mt-5 max-w-[42ch]">{item.body}</p>

                <ul className="mt-8 space-y-3.5">
                  {item.points.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <svg
                        aria-hidden
                        viewBox="0 0 20 20"
                        className="mt-[3px] h-5 w-5 shrink-0"
                      >
                        <circle
                          cx="10"
                          cy="10"
                          r="9"
                          fill="var(--o-tint)"
                        />
                        <path
                          d="M6 10.3l2.6 2.6L14 7.6"
                          fill="none"
                          stroke="var(--o-accent-deep)"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span style={{ color: "var(--o-ink)" }}>{point}</span>
                    </li>
                  ))}
                </ul>
              </OrbitaReveal>
            </div>
          </div>
        );
      })}
    </section>
  );
}
