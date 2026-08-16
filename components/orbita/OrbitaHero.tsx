"use client";

import { useRef, useState } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";

import { OrbitaBackdrop } from "./OrbitaBackdrop";
import { OrbitaImage } from "./OrbitaImage";
import { OrbitaReveal } from "./OrbitaReveal";

export const ORBITA_ASSETS = "/work/orbita/assets";

export function OrbitaHero() {
  const copy = useCopy();
  const orbita = copy.orbitaCase;
  const hero = orbita.hero;

  return (
    <section id="top" className="o-has-bg">
      <OrbitaBackdrop
        src={`${ORBITA_ASSETS}/bg-hero.png`}
        scrim="medium"
        strength={34}
      />

      <div className="o-wrap o-rel grid items-center gap-14 pt-16 pb-20 lg:grid-cols-12 lg:gap-12 lg:pt-24 lg:pb-28">
        <div className="lg:col-span-6">
          <OrbitaReveal>
            {/* The honesty tag, dressed for a light page rather than the
                studio's dark one. */}
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.78rem] font-semibold"
              style={{
                backgroundColor: "rgb(255 255 255 / 0.75)",
                color: "var(--o-accent-text)",
                border: "1px solid rgb(16 217 163 / 0.3)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "var(--o-accent)" }}
              />
              {orbita.demoTag}
            </span>
          </OrbitaReveal>

          <OrbitaReveal delay={60}>
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

          <OrbitaReveal delay={120}>
            <p className="o-lead mt-6 max-w-[46ch]">{hero.subtitle}</p>
          </OrbitaReveal>

          <OrbitaReveal delay={180}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a href="#start" className="o-btn o-btn-primary">
                {hero.primary}
              </a>
              <a href="#product" className="o-btn o-btn-ghost">
                {hero.secondary}
              </a>
            </div>
          </OrbitaReveal>
        </div>

        <OrbitaReveal delay={140} className="lg:col-span-6">
          <HeroMedia />
        </OrbitaReveal>
      </div>
    </section>
  );
}

/**
 * The product, moving.
 *
 * `hero.mp4` autoplays muted and looping with the still as its poster, so
 * the first paint is instant and the motion arrives when it is ready. If
 * the video is missing or the browser refuses it, the still takes over with
 * its slow drift and nothing about the layout changes.
 */
function HeroMedia() {
  const copy = useCopy();
  const orbita = copy.orbitaCase;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="o-shot overflow-hidden">
        <OrbitaImage
          src={`${ORBITA_ASSETS}/hero-visual.png`}
          alt=""
          label={orbita.slots.hero}
          ratio="16 / 9"
          drift
          priority
        />
      </div>
    );
  }

  return (
    <div className="o-shot overflow-hidden">
      <video
        ref={videoRef}
        src={`${ORBITA_ASSETS}/hero.mp4`}
        poster={`${ORBITA_ASSETS}/hero-visual.png`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
        aria-hidden
        style={{ display: "block", width: "100%", aspectRatio: "16 / 9", objectFit: "cover" }}
      />
    </div>
  );
}
