"use client";

import { useState } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";

import { OrbitaMesh } from "./OrbitaMesh";
import { OrbitaReveal } from "./OrbitaReveal";

export const ORBITA_ASSETS = "/work/orbita/assets";

/**
 * A full screen of moving product, with the promise written across it.
 *
 * The video *is* the hero — full-bleed, behind everything, not a still in a
 * card off to one side. The scrim is weighted to the side the type sits on
 * so the words stay near-black and readable while the picture still reads
 * as a picture; below the breakpoint the type moves over the middle of the
 * frame, so the scrim turns vertical to follow it.
 *
 * If the video will not play — missing file, a browser that refuses
 * autoplay, a data-saver — the coded mesh takes over full-bleed. The hero
 * is never a dead static frame.
 */
export function OrbitaHero() {
  const copy = useCopy();
  const orbita = copy.orbitaCase;
  const hero = orbita.hero;
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <section id="top" className="o-hero">
      <div className="o-hero-media">
        {videoFailed ? (
          <OrbitaMesh tone="rich" />
        ) : (
          <video
            src={`${ORBITA_ASSETS}/hero.mp4`}
            poster={`${ORBITA_ASSETS}/hero-visual.png`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoFailed(true)}
            aria-hidden
          />
        )}
      </div>

      <div className="o-hero-scrim" />

      <div className="o-wrap o-rel py-24 lg:py-28">
        <div className="max-w-[34rem]">
          <OrbitaReveal>
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.78rem] font-semibold"
              style={{
                backgroundColor: "rgb(255 255 255 / 0.8)",
                color: "var(--o-accent-text)",
                border: "1px solid rgb(16 217 163 / 0.32)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "var(--o-accent)" }}
              />
              {orbita.demoTag}
            </span>
          </OrbitaReveal>

          <OrbitaReveal delay={80}>
            <h1 className="o-h1 mt-7">
              {hero.headline.map((line, index) => (
                <span key={line} className="block">
                  {index === hero.headline.length - 1 ? (
                    <span style={{ color: "var(--o-accent-text)" }}>{line}</span>
                  ) : (
                    line
                  )}
                </span>
              ))}
            </h1>
          </OrbitaReveal>

          <OrbitaReveal delay={160}>
            <p className="o-lead mt-6 max-w-[42ch]">{hero.subtitle}</p>
          </OrbitaReveal>

          <OrbitaReveal delay={240}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a href="#plans" className="o-btn o-btn-primary">
                {hero.primary}
              </a>
              <a href="#product" className="o-btn o-btn-ghost">
                {hero.secondary}
              </a>
            </div>
          </OrbitaReveal>
        </div>
      </div>
    </section>
  );
}
