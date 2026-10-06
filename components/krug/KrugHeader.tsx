"use client";

import { useEffect, useRef } from "react";

import { scrollToSection } from "@/components/motion/SmoothScroll";

const LINKS = [
  { id: "process", label: "Как это устроено" },
  { id: "classes", label: "Занятия" },
  { id: "shelf", label: "Полка" },
  { id: "studio", label: "Мастерская" },
] as const;

/**
 * The bar across the top: the name, the four parts of the page, and the one
 * thing a visitor came to do. It takes a ground of its own only once the
 * hero has scrolled away, so the first screen is the cup and nothing else.
 */
export function KrugHeader() {
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      bar.current?.setAttribute("data-solid", window.scrollY > 24 ? "true" : "false");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    scrollToSection(id);
  };

  return (
    <header ref={bar} className="kr-bar" data-solid="false">
      <div className="kr-wrap kr-bar-in">
        <a href="#top" onClick={go("top")} className="kr-mark" aria-label="Круг, наверх">
          <svg viewBox="0 0 24 24" aria-hidden className="kr-mark-ring">
            <circle cx="12" cy="12" r="9.5" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          Круг
        </a>
        <nav aria-label="Разделы" className="kr-nav">
          {LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} onClick={go(l.id)}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#book" onClick={go("book")} className="kr-btn kr-btn-small">
          Записаться
        </a>
      </div>
    </header>
  );
}
