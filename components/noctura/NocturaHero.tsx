"use client";

import { useState } from "react";

import { NOCTURA, NOCTURA_ASSETS } from "@/lib/noctura";

import { NocturaReveal } from "./NocturaReveal";

/**
 * A full screen of the tower at night, with the promise written across it.
 *
 * The video *is* the hero: full-bleed, behind everything, never a still in
 * a card off to one side. Two rules govern it.
 *
 * First, it stays crisp. There is no blur, no scale and no filter on the
 * frame itself - the legibility comes from gradient scrims weighted to the
 * bottom-left where the words are, so the skyline stays a skyline.
 *
 * Second, it is never a dead black rectangle. The coded night sits
 * underneath at all times, so a missing file, a browser refusing autoplay,
 * a data-saver or the second before the first frame decodes all resolve to
 * a lit, warm frame rather than to a hole. That is also why there is no
 * poster: a still of the lobby behind a video of the skyline would flash
 * the wrong picture, and the coded ground is the more honest fallback.
 */
export function NocturaHero() {
  const hero = NOCTURA.hero;
  const [failed, setFailed] = useState(false);

  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden"
    >
      {/* The coded night, always painted. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(80% 60% at 68% 30%, rgb(200 169 106 / 0.14), transparent 62%)," +
            "radial-gradient(50% 40% at 20% 82%, rgb(184 132 62 / 0.1), transparent 70%)," +
            "linear-gradient(180deg, #14100c 0%, #0a0809 58%, #08070a 100%)",
        }}
      />

      {!failed && (
        <video
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          src={`${NOCTURA_ASSETS}/hero.mp4`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
          aria-hidden
          tabIndex={-1}
        />
      )}

      {/* Legibility, weighted to the corner the words live in. Two stops
          rather than one flat wash, so the skyline keeps its contrast. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to top, rgb(8 7 9 / 0.92) 0%, rgb(8 7 9 / 0.62) 28%, rgb(8 7 9 / 0.14) 62%, rgb(8 7 9 / 0.34) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to right, rgb(8 7 9 / 0.78) 0%, rgb(8 7 9 / 0.38) 38%, transparent 68%)",
        }}
      />

      {/* --- The promise --- */}
      <div className="n-wrap relative z-10 pb-20 lg:pb-28">
        <NocturaReveal distance={0}>
          <p className="n-label">{NOCTURA.brand.city}</p>
        </NocturaReveal>

        <h1 className="n-h1 mt-8 max-w-[16ch]">
          {hero.headline.map((line, index) => (
            <span key={line} className="block overflow-hidden">
              <span
                className="block"
                style={{
                  animation: `n-rise 1400ms var(--n-lift) ${180 + index * 130}ms both`,
                  color:
                    index === hero.headline.length - 1
                      ? "var(--n-champagne)"
                      : undefined,
                  fontStyle:
                    index === hero.headline.length - 1 ? "italic" : undefined,
                }}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>

        <div
          style={{ animation: "n-rise 1200ms var(--n-lift) 620ms both" }}
          className="mt-9 max-w-[46ch]"
        >
          <p className="n-lead">{hero.subtitle}</p>
        </div>

        <div
          style={{ animation: "n-rise 1200ms var(--n-lift) 760ms both" }}
          className="mt-11 flex flex-wrap items-center gap-x-5 gap-y-4"
        >
          <a href="#booking" className="n-btn n-btn-gold">
            {hero.primary}
          </a>
          <a href="#vestibule" className="n-btn n-btn-ghost">
            {hero.secondary}
          </a>
          <span className="n-small ml-1">{hero.note}</span>
        </div>
      </div>

      {/* --- The cue --- */}
      <div
        aria-hidden
        className="absolute bottom-0 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 pb-8 lg:flex"
      >
        <span
          className="n-label n-label-dim"
          style={{ fontSize: "0.5625rem" }}
        >
          {hero.scroll}
        </span>
        <span className="n-thread" />
      </div>

      <style>{`
        @keyframes n-rise {
          from { opacity: 0; transform: translateY(1.1em); }
          to   { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes n-rise {
            from { opacity: 1; transform: none; }
            to   { opacity: 1; transform: none; }
          }
        }
      `}</style>
    </section>
  );
}
