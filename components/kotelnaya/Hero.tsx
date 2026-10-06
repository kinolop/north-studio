"use client";

import { scrollToSection } from "@/components/motion/SmoothScroll";
import { PLACE } from "@/lib/kotelnaya/data";

import { NowLine } from "./NowLine";
import { Photo } from "./Photo";

/**
 * The first screen is the building, whole and wide, then one band under it
 * like the caption under a photograph in a magazine: what it was, what it
 * is, and what is coming out of the oven this minute.
 */
export function Hero() {
  return (
    <section id="top" className="kt-hero" aria-labelledby="kt-hero-title">
      <figure className="kt-hero-photo">
        <Photo
          slug="exterior"
          alt="Кирпичная котельная с высокой трубой во дворе старой фабрики, осеннее утро, в арочных окнах свет"
          sizes="100vw"
          priority
        />
      </figure>
      <div className="kt-wrap kt-hero-band">
        <div className="kt-hero-left">
          <p className="kt-eyebrow">
            {PLACE.kind} · {PLACE.district}, {PLACE.city}
          </p>
          <h1 id="kt-hero-title" className="kt-h1">
            Здесь грели воду для фабрики. <em>Теперь печём хлеб.</em>
          </h1>
        </div>
        <div className="kt-hero-right">
          <NowLine className="kt-now" />
          <div className="kt-hero-actions">
            <a
              href="#order"
              className="kt-btn"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("order");
              }}
            >
              Отложить хлеб к своему часу
            </a>
            <p className="kt-hero-hours">
              Каждый день с 08:00 до {PLACE.closes}:00
              <br />
              {PLACE.address}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
