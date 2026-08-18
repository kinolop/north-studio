"use client";

import { useEffect, useState } from "react";

import { NOCTURA } from "@/lib/noctura";

import { NocturaMark } from "./NocturaMark";

/**
 * One header for the whole page, in two states.
 *
 * Over the hero it is nothing but the mark, the nav and the button sitting
 * on the film. Once the tower has scrolled past it earns a ground: a warm
 * near-black wash, a blur, and the brass hairline that runs under every
 * other structural edge on this page.
 *
 * The threshold is 82vh rather than a fixed pixel count so it always fires
 * as the hero leaves, on a laptop and on a phone alike.
 */
export function NocturaHeader() {
  const [seated, setSeated] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setSeated(window.scrollY > window.innerHeight * 0.82);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-40"
      style={{
        backgroundColor: seated ? "rgb(10 8 9 / 0.82)" : "transparent",
        backdropFilter: seated ? "blur(14px) saturate(130%)" : "none",
        WebkitBackdropFilter: seated ? "blur(14px) saturate(130%)" : "none",
        borderBottom: `1px solid ${seated ? "var(--n-line)" : "transparent"}`,
        transition:
          "background-color 620ms var(--n-ease), border-color 620ms var(--n-ease), backdrop-filter 620ms var(--n-ease)",
      }}
    >
      <div className="n-wrap flex items-center justify-between gap-6 py-6 lg:py-7">
        <a href="#top" aria-label={NOCTURA.brand.name} className="shrink-0">
          <NocturaMark size="md" />
        </a>

        <nav
          className="hidden items-center gap-9 lg:flex"
          aria-label="Разделы отеля"
        >
          {NOCTURA.nav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="n-link n-label"
              style={{ color: "var(--n-smoke)", letterSpacing: "0.22em" }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-5">
          <span
            className="n-label n-label-dim hidden sm:inline"
            style={{ fontSize: "0.5625rem" }}
          >
            {NOCTURA.brand.demoTag}
          </span>
          <a
            href="#booking"
            className="n-btn n-btn-ghost"
            style={{ padding: "0.7rem 1.4rem", minHeight: "42px" }}
          >
            {NOCTURA.hero.primary}
          </a>
        </div>
      </div>
    </header>
  );
}
