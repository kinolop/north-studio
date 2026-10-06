"use client";

import { useEffect, useRef } from "react";

import { scrollToSection } from "@/components/motion/SmoothScroll";

const LINKS = [
  { id: "oven", label: "Из печи" },
  { id: "bread", label: "Хлеб" },
  { id: "coffee", label: "Кофе" },
  { id: "place", label: "Место" },
  { id: "visit", label: "Как дойти" },
] as const;

/**
 * The bar across the top. Over the photograph it is light and has no
 * ground; once the photograph has gone it sits on flour-white like the
 * rest of the page.
 */
export function KotelnayaHeader() {
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.querySelector<HTMLElement>(".kt-hero-photo");
      const edge = hero ? hero.getBoundingClientRect().bottom - 64 : 0;
      bar.current?.setAttribute("data-over", edge > 0 ? "photo" : "page");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const go = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    scrollToSection(id);
  };

  return (
    <header ref={bar} className="kt-bar" data-over="photo">
      <div className="kt-wrap kt-bar-in">
        <a href="#top" onClick={go("top")} className="kt-mark">
          Котельная
        </a>
        <nav aria-label="Разделы" className="kt-nav">
          {LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} onClick={go(l.id)}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#order" onClick={go("order")} className="kt-btn kt-btn-small">
          Отложить хлеб
        </a>
      </div>
    </header>
  );
}
