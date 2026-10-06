"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

import { scrollToSection } from "@/components/motion/SmoothScroll";
import { FIRST_CUP, clayGrams, cm, vesselName, volumeMl, widest } from "@/lib/krug/profile";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { cupStore, useCup } from "./store";

/**
 * The first screen. The studio's name is set as large as the screen will
 * hold, and the cup on the wheel stands in front of it, on the layer above
 * (see `Stage`). Under them, the offer in two lines and the way to take it;
 * opposite, what the visitor has made so far, read off the cup itself.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const profile = useCup((c) => c.profile);
  const touched = useCup((c) => c.touched);

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      gsap.from(q(".kr-giant span"), { yPercent: 100, duration: 1.6, ease: "expo.out", stagger: 0.06, delay: 0.1 });
      gsap.from(q(".kr-hero-after"), { opacity: 0, y: 20, duration: 1.1, ease: "expo.out", stagger: 0.08, delay: 0.7 });
      // The name drifts up and away as the page leaves the first screen.
      gsap.to(q(".kr-giant"), {
        yPercent: -18,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  const name = vesselName(profile);
  const ml = Math.round(volumeMl(profile) / 10) * 10;
  const grams = Math.round(clayGrams(profile) / 10) * 10;

  return (
    <section ref={root} id="top" className="kr-hero" aria-labelledby="kr-hero-title">
      <p className="kr-giant" aria-hidden>
        {"Круг".split("").map((ch, i) => (
          <span key={i}>{ch}</span>
        ))}
      </p>

      <div className="kr-wrap kr-hero-foot">
        <div className="kr-hero-copy">
          <h1 id="kr-hero-title" className="kr-hero-title kr-hero-after">
            Гончарная мастерская на Бауманской. Первая чашка за&nbsp;один вечер.
          </h1>
          <div className="kr-hero-cta kr-hero-after">
            <a
              href="#classes"
              className="kr-btn"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("classes");
              }}
            >
              Записаться на первое занятие
            </a>
            <p className="kr-hero-price">
              <span className="kr-num">3&thinsp;500&nbsp;₽</span>, глина и&nbsp;два обжига включены
            </p>
          </div>
        </div>

        <div className="kr-readout kr-hero-after" aria-live="polite">
          <p className="kr-readout-hint" data-hidden={touched}>
            Потяните за точки на стенке. Так её вытягивают на круге.
          </p>
          <p className="kr-readout-name">
            Получается <em>{name}</em>
          </p>
          <p className="kr-readout-figs kr-num">
            Ø&nbsp;{cm(widest(profile))}&nbsp;см, высота {cm(profile.lip.y)}&nbsp;см, {ml}&nbsp;мл, {grams}&nbsp;г&nbsp;глины
          </p>
          {touched && (
            <button type="button" className="kr-link" onClick={() => cupStore.set({ profile: FIRST_CUP })}>
              Вернуть первую чашку
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
