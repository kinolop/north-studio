"use client";

import { useEffect, useRef } from "react";

import { scrollToSection } from "@/components/motion/SmoothScroll";

import { useBoot } from "./boot";
import { Sentence } from "./Sentence";
import { heroFrame, type Rect } from "./Stage";
import { Ticket } from "./Ticket";

/**
 * The first screen: the night map behind, the words in front.
 *
 * On a wide screen the words sit at the bottom corners and the route lives
 * in the space above them. On a phone the words stack below the map, and the
 * route is fitted into whatever height is left above the first line of them,
 * measured from the page rather than guessed. The stage asks for that space
 * through `heroFrame`.
 */
export function Hero() {
  const b = useBoot();
  const section = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    heroFrame.current = (): Rect => {
      const hero = section.current;
      const words = copy.current;
      if (window.innerWidth >= 900 || !hero || !words) {
        // Names stand above the two ends, so the route keeps clear of the header.
        const tall = Math.max(1, hero?.clientHeight ?? window.innerHeight);
        return { x0: -0.9, x1: 0.9, y0: 0.12, y1: Math.min(0.84, 1 - 216 / tall) };
      }
      const H = Math.max(1, hero.clientHeight);
      const y1 = 1 - (2 * 96) / H;
      const y0 = 1 - (2 * (words.offsetTop - 24)) / H;
      return { x0: -0.9, x1: 0.9, y0: Math.min(y0, y1 - 0.25), y1 };
    };
  }, []);

  return (
    <section ref={section} className="mr-hero" id="top" data-ready={b.opened}>
      <div ref={copy} className="mr-copy">
        <Sentence />
        <p className="mr-sub">
          Цена на штуку, таможня и срок с вероятностью. Потяните число или выберите слово, и груз с маршрутом
          пересчитаются.
        </p>
        <div className="mr-actions">
          <button type="button" className="mr-btn" onClick={() => scrollToSection("tracking")}>
            Отправить в путь
          </button>
          <button type="button" className="mr-btn" data-ghost="true" onClick={() => scrollToSection("docs")}>
            Накладная
          </button>
        </div>
      </div>
      <Ticket />
    </section>
  );
}
