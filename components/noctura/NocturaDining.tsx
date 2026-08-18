"use client";

import { NOCTURA, NOCTURA_ASSETS } from "@/lib/noctura";

import { NocturaPlate } from "./NocturaPlate";
import { NocturaReveal } from "./NocturaReveal";

/**
 * The restaurant on 41.
 *
 * Mirrored against the manifesto - picture left, prose right - so the two
 * text-and-image sections do not stack into the same shape twice. The three
 * "experiences" are a real trio (a room, a counter, a bar), so they are
 * numbered by nothing and simply ruled apart: numbering them 01/02/03 would
 * claim a sequence that does not exist.
 */
export function NocturaDining() {
  const copy = NOCTURA.dining;

  return (
    <section id="dining" className="n-section">
      <div
        className="n-warm"
        aria-hidden
        style={
          {
            "--n-warm-x": "70%",
            "--n-warm-y": "44%",
            "--n-warm-strength": "0.07",
          } as React.CSSProperties
        }
      />

      <div className="n-wrap n-rel">
        <div className="grid gap-y-14 lg:grid-cols-12 lg:items-center lg:gap-x-16">
          <NocturaReveal
            distance={40}
            className="lg:col-span-7 lg:order-1"
          >
            <NocturaPlate
              src={`${NOCTURA_ASSETS}/dining.png`}
              alt="Сервированный стол у панорамного окна ресторана NOCTURA со свечой и видом на ночной город"
              slot={NOCTURA.slots.dining}
              sizes="(max-width: 1023px) 130vw, 70vw"
              ratio="16 / 11"
              parallax={30}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgb(8 7 9 / 0.5), transparent 46%)",
                }}
              />
            </NocturaPlate>
          </NocturaReveal>

          <div className="lg:col-span-5 lg:order-2">
            <NocturaReveal>
              <p className="n-label">{copy.eyebrow}</p>
            </NocturaReveal>

            <NocturaReveal delay={90} distance={30}>
              <h2 className="n-h2 mt-7">
                {copy.title.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            </NocturaReveal>

            <NocturaReveal delay={170}>
              <p className="n-lead mt-8 max-w-[44ch]">{copy.lede}</p>
            </NocturaReveal>

            <NocturaReveal delay={240}>
              <p className="n-body mt-6 max-w-[52ch]">{copy.body}</p>
            </NocturaReveal>
          </div>
        </div>

        <div className="mt-24 lg:mt-28">
          <NocturaReveal>
            <p className="n-label n-label-dim">{copy.experiencesLabel}</p>
          </NocturaReveal>

          <div className="mt-10 grid gap-x-14 gap-y-10 md:grid-cols-3">
            {copy.experiences.map((experience, index) => (
              <NocturaReveal
                key={experience.key}
                delay={index * 110}
                distance={20}
              >
                <div
                  className="h-full pt-7"
                  style={{ borderTop: "1px solid var(--n-line)" }}
                >
                  <h3 className="n-h3">{experience.name}</h3>
                  <p className="n-body mt-4 max-w-[38ch]">{experience.body}</p>
                </div>
              </NocturaReveal>
            ))}
          </div>

          <NocturaReveal delay={360}>
            <p className="n-small mt-12">{copy.note}</p>
          </NocturaReveal>
        </div>
      </div>
    </section>
  );
}
