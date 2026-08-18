"use client";

import { NOCTURA } from "@/lib/noctura";

import { NocturaReveal } from "./NocturaReveal";

/**
 * Guest quotes, and an honest label on them.
 *
 * These are written for a hotel that does not exist, so the note saying
 * exactly that sits directly under the heading rather than in small print
 * at the foot of the page. A demo that dresses invented praise up as real
 * reviews is the one thing this case must not do - the whole argument of
 * the page is that the studio can build a convincing brand, not that it can
 * fake social proof.
 *
 * The quote mark is a real typographic character in the display serif, set
 * large and translucent, not an SVG of one.
 */
export function NocturaVoices() {
  const copy = NOCTURA.voices;

  return (
    <section id="voices" className="n-section">
      <div
        className="n-warm"
        aria-hidden
        style={
          {
            "--n-warm-x": "50%",
            "--n-warm-y": "40%",
            "--n-warm-strength": "0.055",
          } as React.CSSProperties
        }
      />

      <div className="n-wrap n-rel">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
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

          <NocturaReveal delay={160} className="lg:col-span-5 lg:col-start-8">
            <p className="n-small max-w-[44ch]">{copy.note}</p>
          </NocturaReveal>
        </div>

        <ul className="mt-16 grid list-none gap-6 p-0 lg:mt-20 lg:grid-cols-3">
          {copy.items.map((item, index) => (
            <NocturaReveal
              key={item.key}
              as="li"
              delay={index * 130}
              distance={26}
              className="h-full"
            >
              <figure className="n-quote flex h-full flex-col">
                <span className="n-quote-mark" aria-hidden>
                  &ldquo;
                </span>

                <blockquote className="m-0 mt-6 flex-1">
                  <p
                    style={{
                      fontFamily: "var(--font-cormorant), serif",
                      fontSize: "clamp(1.2rem, 1.6vw, 1.4rem)",
                      fontStyle: "italic",
                      fontWeight: 300,
                      lineHeight: 1.5,
                      color: "var(--n-ivory)",
                      margin: 0,
                    }}
                  >
                    {item.quote}
                  </p>
                </blockquote>

                <figcaption
                  className="mt-9 pt-6"
                  style={{ borderTop: "1px solid var(--n-line-soft)" }}
                >
                  <p
                    className="n-label"
                    style={{ fontSize: "0.625rem", letterSpacing: "0.26em" }}
                  >
                    {item.name}
                  </p>
                  <p className="n-small mt-2.5">{item.meta}</p>
                </figcaption>
              </figure>
            </NocturaReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
