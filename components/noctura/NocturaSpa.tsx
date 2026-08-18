"use client";

import { NOCTURA, NOCTURA_ASSETS } from "@/lib/noctura";

import { NocturaPlate } from "./NocturaPlate";
import { NocturaReveal } from "./NocturaReveal";

/**
 * The spa, on the only floor of the building that has no windows.
 *
 * This one runs full-bleed and edge to edge rather than inside the
 * container. Every other section on the page is a column of type with a
 * picture beside it; dropping the gutters here makes the descent into the
 * stone basement feel like the building actually changing material, which
 * is the one thing the copy is claiming. The scrim is horizontal because
 * the words sit on the left of the frame, not under it.
 */
export function NocturaSpa() {
  const copy = NOCTURA.spa;

  return (
    <section id="spa" className="n-section">
      <div
        className="n-warm"
        aria-hidden
        style={
          {
            "--n-warm-x": "50%",
            "--n-warm-y": "18%",
            "--n-warm-strength": "0.05",
          } as React.CSSProperties
        }
      />

      <div className="n-rel">
        <div className="relative">
          <NocturaPlate
            src={`${NOCTURA_ASSETS}/spa.png`}
            alt="Термальный бассейн NOCTURA в каменном подвале, подсвеченный свечами по периметру"
            slot={NOCTURA.slots.spa}
            sizes="100vw"
            ratio="21 / 9"
            parallax={40}
            className="!rounded-none"
          >
            <div className="n-scrim-even" aria-hidden />
          </NocturaPlate>

          {/* Sits over the plate from the large breakpoint up, and drops
              below it on narrow screens where an overlay would land on the
              busiest part of the picture. */}
          <div className="mt-10 lg:absolute lg:inset-0 lg:mt-0 lg:flex lg:items-center">
            <div className="n-wrap">
              <div className="max-w-[40rem]">
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
                  <p className="n-lead mt-8 max-w-[46ch]">{copy.lede}</p>
                </NocturaReveal>
              </div>
            </div>
          </div>
        </div>

        <div className="n-wrap mt-20 lg:mt-24">
          <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-16">
            <NocturaReveal className="lg:col-span-5">
              <p className="n-serif-lead max-w-[34ch]">{copy.body}</p>
            </NocturaReveal>

            <div className="lg:col-span-6 lg:col-start-7">
              <NocturaReveal delay={80}>
                <p className="n-label n-label-dim">{copy.treatmentsLabel}</p>
              </NocturaReveal>

              <dl className="mt-9">
                {copy.treatments.map((treatment, index) => (
                  <NocturaReveal
                    key={treatment.key}
                    delay={120 + index * 100}
                    distance={18}
                  >
                    <div
                      className="grid gap-2 py-7"
                      style={{ borderTop: "1px solid var(--n-line-soft)" }}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                        <dt className="n-h3">{treatment.name}</dt>
                        <span className="n-label n-label-dim shrink-0">
                          {treatment.duration}
                        </span>
                      </div>
                      <dd className="n-body m-0 max-w-[52ch]">
                        {treatment.body}
                      </dd>
                    </div>
                  </NocturaReveal>
                ))}
                <div
                  aria-hidden
                  style={{
                    height: "1px",
                    backgroundColor: "var(--n-line-soft)",
                  }}
                />
              </dl>

              <NocturaReveal delay={420}>
                <p className="n-small mt-8">{copy.note}</p>
              </NocturaReveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
