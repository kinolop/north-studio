"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

import { scrollToSection } from "@/components/motion/SmoothScroll";
import { PLACE } from "@/lib/kotelnaya/data";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { NowLine } from "./NowLine";
import { Photo } from "./Photo";

gsap.registerPlugin(ScrollTrigger);

/**
 * The way in, as one held shot. The courtyard and the boiler house first,
 * with the name across it. Scrolling walks through the door: the
 * photograph pushes in on the arched entrance until the hall under its
 * brick vault takes its place, then on into the hall until the oven fills
 * the frame. Three photographs, two dissolves, no cuts.
 *
 * Each push-in is aimed at the thing it goes through (the door, then the
 * oven's mouth), and the photograph is framed on that same point, so on a
 * narrow phone the walk still heads for the door rather than a wall.
 */
export function Entrance() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      // The first screen arrives: the name rises, the rest follows.
      gsap.from(q(".kt-wordmark span"), { yPercent: 105, duration: 1.4, ease: "expo.out", delay: 0.15 });
      gsap.from(q(".kt-film-copy .kt-film-after"), {
        opacity: 0,
        y: 18,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.08,
        delay: 0.55,
      });
      gsap.from(q('.kt-film-frame[data-f="0"] img'), { scale: 1.12, duration: 2.4, ease: "expo.out" });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.8 },
      });
      tl.to(q(".kt-film-copy"), { opacity: 0, y: -60, duration: 0.12 }, 0.06)
        .to(q('.kt-film-frame[data-f="0"]'), { scale: 3.2, duration: 0.4, ease: "power2.in" }, 0.06)
        .fromTo(q('.kt-film-frame[data-f="1"]'), { opacity: 0, scale: 1.35 }, { opacity: 1, scale: 1, duration: 0.24, ease: "power1.out" }, 0.26)
        .fromTo(q('.kt-film-cap[data-cap="1"]'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.08 }, 0.42)
        .to(q('.kt-film-cap[data-cap="1"]'), { opacity: 0, y: -30, duration: 0.08 }, 0.58)
        .to(q('.kt-film-frame[data-f="1"]'), { scale: 2.6, duration: 0.36, ease: "power2.in" }, 0.56)
        .fromTo(q('.kt-film-frame[data-f="2"]'), { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.22, ease: "power1.out" }, 0.72)
        .fromTo(q('.kt-film-cap[data-cap="2"]'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.08 }, 0.86)
        .to({}, { duration: 0.06 }, 0.94);
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} id="top" className="kt-film" aria-labelledby="kt-title" data-reduced={reduced}>
      <div className="kt-film-stage">
        <div className="kt-film-frame" data-f="0">
          <Photo
            slug="exterior"
            alt="Кирпичная котельная с высокой трубой во дворе старой фабрики, осеннее утро, в арочных окнах свет"
            sizes="100vw"
            priority
          />
        </div>
        <div className="kt-film-frame" data-f="1">
          <Photo
            slug="hall"
            alt="Зал под кирпичным сводом: длинные столы, свет из арочных окон, в глубине каменная печь и пекарь"
            sizes="100vw"
          />
        </div>
        <div className="kt-film-frame" data-f="2">
          <Photo slug="oven" alt="Пекарь вынимает ржаной хлеб из каменной печи на деревянной лопате" sizes="100vw" />
        </div>
        <div className="kt-film-shade" aria-hidden />

        <div className="kt-wrap kt-film-copy">
          <h1 id="kt-title" className="kt-wordmark">
            <span>Котельная</span>
          </h1>
          <div className="kt-film-foot">
            <p className="kt-film-sub kt-film-after">
              Пекарня и кофе в котельной {PLACE.built}&nbsp;года. {PLACE.district}, {PLACE.city}.
            </p>
            <NowLine className="kt-now kt-film-after" />
            <a
              href="#order"
              className="kt-btn kt-btn-light kt-film-after"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("order");
              }}
            >
              Отложить хлеб к своему часу
            </a>
          </div>
        </div>

        <p className="kt-film-cap" data-cap="1">
          Сто двадцать мест под кирпичным сводом. Столы на шестерых, розетка у каждого окна.
        </p>
        <p className="kt-film-cap" data-cap="2">
          Печь стоит там, где сто лет стояли котлы.
        </p>
      </div>
    </section>
  );
}
