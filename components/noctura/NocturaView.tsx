"use client";

import { NOCTURA, NOCTURA_ASSETS } from "@/lib/noctura";

import { NocturaPlate } from "./NocturaPlate";
import { NocturaReveal } from "./NocturaReveal";

/**
 * Floor 42, and the argument for the address.
 *
 * The shortest section on the page on purpose. It comes straight after the
 * restaurant, which is dense, and straight before the guest quotes, which
 * are dense again - so this one is a single wide picture, one paragraph and
 * three facts. Somewhere on a page this long the reader has to be allowed
 * to just look at something.
 */
export function NocturaView() {
  const copy = NOCTURA.view;

  return (
    <section id="view" className="n-section">
      <div
        className="n-warm"
        aria-hidden
        style={
          {
            "--n-warm-x": "50%",
            "--n-warm-y": "70%",
            "--n-warm-strength": "0.06",
          } as React.CSSProperties
        }
      />

      <div className="n-rel">
        <div className="n-wrap">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
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
            </div>

            <NocturaReveal delay={170} className="lg:col-span-5">
              <p className="n-body max-w-[48ch]">{copy.body}</p>
            </NocturaReveal>
          </div>
        </div>

        <NocturaReveal delay={120} distance={40}>
          <div className="mt-16 lg:mt-20">
            <NocturaPlate
              src={`${NOCTURA_ASSETS}/view.png`}
              alt="Ночная панорама города и реки из окна верхнего этажа NOCTURA"
              slot={NOCTURA.slots.view}
              sizes="100vw"
              ratio="21 / 9"
              parallax={44}
              className="!rounded-none"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgb(8 7 9 / 0.72), transparent 40%)",
                }}
              />
              <p
                className="n-label n-label-dim absolute bottom-6 left-1/2 -translate-x-1/2 text-center"
                style={{ fontSize: "0.5625rem" }}
              >
                {copy.address} · {NOCTURA.brand.city}
              </p>
            </NocturaPlate>
          </div>
        </NocturaReveal>

        <div className="n-wrap mt-16 lg:mt-20">
          <dl className="grid gap-x-14 gap-y-9 md:grid-cols-3">
            {copy.facts.map((fact, index) => (
              <NocturaReveal key={fact.key} delay={index * 110} distance={16}>
                <div
                  className="pt-6"
                  style={{ borderTop: "1px solid var(--n-line)" }}
                >
                  <dt className="n-label n-label-dim">{fact.label}</dt>
                  <dd
                    className="mt-3 m-0"
                    style={{
                      fontFamily: "var(--font-cormorant), serif",
                      fontSize: "clamp(1.3rem, 1.9vw, 1.65rem)",
                      lineHeight: 1.25,
                      color: "var(--n-ivory)",
                    }}
                  >
                    {fact.value}
                  </dd>
                </div>
              </NocturaReveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
