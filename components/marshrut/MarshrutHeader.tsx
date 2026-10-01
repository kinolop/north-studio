"use client";

import { useEffect, useRef } from "react";

import { scrollToSection } from "@/components/motion/SmoothScroll";
import { num } from "@/lib/marshrut/format";

import { useMoment, moment } from "./moment";
import { useQuote } from "./store";

/** What each chapter is called in the bar. */
const NAMES = ["Расчёт", "Груз", "Пути", "В пути", "Граница", "Последняя миля", "Приёмка"] as const;

/**
 * The bar across the top, and it is the journey in one line.
 *
 * Origin on the left, the warehouse on the right, the border crossing where
 * it falls between them. The line fills in as the cargo moves, a marker
 * rides at its head, and the day counter beside it runs from nought to the
 * median the ticket promised. Scroll is the clock: nothing here moves unless
 * the reader does.
 *
 * The three marks on the line are also the way around the page: the origin
 * goes to the cargo, the crossing to the papers, the warehouse to the form.
 */
export function MarshrutHeader() {
  const q = useQuote();
  const chapter = useMoment((m) => m.chapter, 0);
  const fill = useRef<HTMLSpanElement>(null);
  const head = useRef<HTMLSpanElement>(null);
  const day = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLElement>(null);

  const gateAt = q.route.gate.s / Math.max(1, q.route.length);
  const total = Math.round(q.days.p50);
  const totalRef = useRef(q.days.p50);
  totalRef.current = q.days.p50;

  useEffect(() => {
    let lastDay = -1;
    let lastFrac = -1;
    let lastSolid = "";
    return moment.subscribe((m) => {
      const frac = Math.round(m.frac * 1000) / 1000;
      if (frac !== lastFrac) {
        lastFrac = frac;
        if (fill.current) fill.current.style.transform = `scaleX(${frac})`;
        if (head.current) head.current.style.left = `${(frac * 100).toFixed(2)}%`;
      }
      // On arrival the counter lands on the promised number, not the day before it.
      const p50 = totalRef.current;
      const d = m.day >= p50 - 0.02 ? Math.round(p50) : Math.floor(m.day + 1e-6);
      if (d !== lastDay) {
        lastDay = d;
        if (day.current) day.current.textContent = String(d).padStart(2, "0");
      }
      const solid = window.scrollY > window.innerHeight * 0.4 ? "true" : "false";
      if (solid !== lastSolid && bar.current) {
        lastSolid = solid;
        bar.current.dataset.solid = solid;
      }
    });
  }, []);

  const go = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    scrollToSection(id);
  };

  return (
    <header ref={bar} className="mr-header" data-solid="false">
      <a href="#top" className="mr-mark" onClick={go("top")} aria-label="Маршрут, в начало">
        Маршрут
      </a>

      <nav className="mr-rail-nav" aria-label="Путь груза">
        <div className="mr-rail">
          <span className="mr-rail-line" />
          <span ref={fill} className="mr-rail-fill" />
          <a href="#density" className="mr-rail-stop" data-kind="origin" style={{ left: "0%" }} onClick={go("density")}>
            <i />
            <span>{q.route.origin.name}</span>
          </a>
          <a
            href="#docs"
            className="mr-rail-stop"
            data-kind="gate"
            data-crowded={gateAt > 0.72 ? "true" : undefined}
            style={{ left: `${(gateAt * 100).toFixed(2)}%` }}
            onClick={go("docs")}
          >
            <i />
            <span>{q.route.gate.name}</span>
          </a>
          <a href="#request" className="mr-rail-stop" data-kind="dest" style={{ left: "100%" }} onClick={go("request")}>
            <i />
            <span>{q.route.dest.name}</span>
          </a>
          <span ref={head} className="mr-rail-head" aria-hidden />
        </div>
      </nav>

      <div className="mr-clock" aria-live="off">
        <span className="mr-clock-chapter">{NAMES[chapter]}</span>
        <span className="mr-clock-day">
          <span className="mr-clock-label">день</span>
          <span ref={day} className="mr-clock-n mr-num">
            00
          </span>
          <span className="mr-clock-of mr-num">/ {num(total)}</span>
        </span>
      </div>

      <a href="#request" className="mr-btn mr-btn-cta" onClick={go("request")}>
        Отправить расчёт
      </a>
    </header>
  );
}
