"use client";

import { NOCTURA, NOCTURA_ASSETS } from "@/lib/noctura";

import { NocturaFigures } from "./NocturaFigures";
import { NocturaPlate } from "./NocturaPlate";
import { NocturaReveal } from "./NocturaReveal";

/**
 * The manifesto: where the hotel stands and what the night there is like.
 *
 * This is the section a thin demo leaves empty - a headline, one sentence
 * of filler and a lot of air. So it is deliberately the densest text on the
 * page: three real paragraphs about the building, the lobby standing beside
 * them at full height, and a row of illustrative figures closing it out.
 * The prose runs at a 58-character measure and the paragraphs are staggered
 * rather than revealed together, so the length reads as generous instead of
 * as a wall.
 */
export function NocturaManifesto() {
  const copy = NOCTURA.manifesto;

  return (
    <section id="vestibule" className="n-section">
      <div
        className="n-warm"
        aria-hidden
        style={
          {
            "--n-warm-x": "22%",
            "--n-warm-y": "30%",
            "--n-warm-strength": "0.075",
          } as React.CSSProperties
        }
      />

      <div className="n-wrap n-rel">
        <NocturaReveal>
          <p className="n-label">{copy.eyebrow}</p>
        </NocturaReveal>

        <div className="mt-10 grid gap-y-14 lg:grid-cols-12 lg:gap-x-16">
          <div className="lg:col-span-6">
            <NocturaReveal delay={80} distance={34}>
              <h2 className="n-h2">
                {copy.title.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            </NocturaReveal>

            <div className="mt-12 space-y-7">
              {copy.body.map((paragraph, index) => (
                <NocturaReveal key={paragraph.slice(0, 24)} delay={index * 110}>
                  <p className="n-body max-w-[58ch]">{paragraph}</p>
                </NocturaReveal>
              ))}
            </div>
          </div>

          {/* The lobby, beside the prose rather than lying across it.
              Square: a portrait crop of a 1280x714 file would have to
              magnify it past its own resolution, and this is the one image
              on the page a reader looks at while standing still. */}
          <NocturaReveal
            delay={140}
            distance={40}
            className="lg:col-span-6 lg:pt-4"
          >
            <NocturaPlate
              src={`${NOCTURA_ASSETS}/lobby.png`}
              alt="Вестибюль NOCTURA ночью: люстра, камин и стойка ресепшена в тёплом свете"
              slot={NOCTURA.slots.lobby}
              sizes="(max-width: 1023px) 105vw, 80vw"
              ratio="1 / 1"
              parallax={34}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgb(8 7 9 / 0.55), transparent 42%)",
                }}
              />
              <p
                className="n-label n-label-dim absolute bottom-6 left-6"
                style={{ fontSize: "0.5625rem" }}
              >
                Вестибюль · Этаж 01
              </p>
            </NocturaPlate>
          </NocturaReveal>
        </div>

        <div className="mt-24 lg:mt-32">
          <hr className="n-rule" />
          <div className="mt-16">
            <NocturaFigures items={copy.figures} note={copy.figuresNote} />
          </div>
        </div>
      </div>
    </section>
  );
}
