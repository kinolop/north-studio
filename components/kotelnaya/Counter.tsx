"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

import { BAKES, BREADS, clock, rub } from "@/lib/kotelnaya/data";
import { isTouchScreen } from "@/lib/touch";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { basketStore, useBasket } from "./basket";
import { Photo } from "./Photo";

gsap.registerPlugin(ScrollTrigger);

/**
 * The counter. Six breads, each photographed from above on the same slab
 * of slate in the same window light, laid out one after another so the
 * page slides along them sideways the way the eye runs along a counter.
 * Scrolling down moves the counter; nothing else on the screen does.
 *
 * On a touch screen, and under reduced motion, the counter is simply a
 * column: a sideways pin under a thumb fights the thumb.
 */
export function Counter() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const basket = useBasket();

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr || reduced || isTouchScreen()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      const distance = () => Math.max(0, tr.scrollWidth - window.innerWidth);
      gsap.to(tr, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    });
    return () => mm.revert();
  }, [reduced]);

  return (
    <section ref={root} id="bread" className="kt-counter" aria-labelledby="kt-counter-title">
      <div ref={track} className="kt-counter-track">
        <div className="kt-counter-intro">
          <h2 id="kt-counter-title" className="kt-h2" data-kt-split>
            Прилавок
          </h2>
          <p className="kt-lead">
            Шесть позиций, и каждая выходит из печи в своё время. Мука с мельницы под Псковом, масло с фермы в
            Ленобласти.
          </p>
        </div>

        {BREADS.map((b) => {
          const times = BAKES.filter((x) => x.bread === b.id).map((x) => clock(x.at));
          const count = basket[b.id] ?? 0;
          return (
            <article key={b.id} className="kt-loaf">
              <div className="kt-loaf-pic">
                <Photo slug={b.photo} alt={`${b.name} на сланцевой плите`} sizes="(min-width: 900px) 62vw, 100vw" />
              </div>
              <div className="kt-loaf-cap">
                <h3 className="kt-loaf-name">{b.name}</h3>
                <p className="kt-loaf-price kt-num">{rub(b.price)}</p>
                <p className="kt-loaf-body">{b.body}</p>
                <p className="kt-loaf-meta">
                  <span className="kt-num">{b.weight}</span>, из печи в <span className="kt-num">{times.join(" и ")}</span>
                </p>
                <button
                  type="button"
                  className="kt-loaf-add"
                  onClick={() => basketStore.add(b.id, 1)}
                  aria-label={`Отложить: ${b.name}`}
                >
                  <span aria-hidden>+</span>
                  {count > 0 ? `Отложено: ${count}` : "Отложить"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
