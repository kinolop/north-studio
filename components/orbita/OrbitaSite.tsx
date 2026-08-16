"use client";

import { useEffect } from "react";

import { useCopy, useLocale } from "@/components/i18n/CopyProvider";
import { LOCALES } from "@/lib/i18n";

import { OrbitaClose } from "./OrbitaClose";
import { OrbitaFeatures } from "./OrbitaFeatures";
import { OrbitaHero } from "./OrbitaHero";
import { OrbitaLifestyle } from "./OrbitaLifestyle";
import { OrbitaLogo } from "./OrbitaMark";
import { OrbitaSecurity } from "./OrbitaSecurity";
import { OrbitaSteps } from "./OrbitaSteps";
import { OrbitaTrustBar } from "./OrbitaTrustBar";

import "./orbita.css";

/**
 * ORBITA's site, whole.
 *
 * The only things this shares with North Studio are the locale provider —
 * which carries data, not looks — and the route it lives on. Everything
 * visible is ORBITA's: its own stylesheet, its own header and footer, its
 * own reveal, its own image component. The studio's fixed chrome is
 * suppressed for this route by StudioChrome, so nothing of it renders at
 * all.
 */
export function OrbitaSite() {
  // The document body is painted near-black for the studio. This page is
  // off-white, and without this the rubber-band overscroll at the top of
  // the page flashes the studio's colour through.
  useEffect(() => {
    const previous = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#f7f8fa";
    return () => {
      document.body.style.backgroundColor = previous;
    };
  }, []);

  return (
    <div className="orbita">
      <OrbitaHeader />

      <OrbitaHero />
      <OrbitaTrustBar />
      <OrbitaFeatures />
      <OrbitaSecurity />
      <OrbitaLifestyle />
      <OrbitaSteps />
      <OrbitaClose />

      <OrbitaFooter />
    </div>
  );
}

function OrbitaHeader() {
  const copy = useCopy();
  const { locale, setLocale } = useLocale();
  const orbita = copy.orbitaCase;

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: "rgb(255 255 255 / 0.86)",
        backdropFilter: "saturate(180%) blur(14px)",
        WebkitBackdropFilter: "saturate(180%) blur(14px)",
        borderBottom: "1px solid var(--o-line)",
      }}
    >
      <div className="o-wrap flex h-[68px] items-center justify-between gap-6">
        <a href="#top" className="shrink-0">
          <OrbitaLogo />
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Orbita">
          {orbita.nav.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="text-[0.94rem] transition-colors duration-200"
              style={{ color: "var(--o-body)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--o-ink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--o-body)")}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div
            className="flex items-center rounded-full p-0.5"
            style={{ border: "1px solid var(--o-line)" }}
            role="group"
            aria-label={copy.studio.languageLabel}
          >
            {LOCALES.map((code) => {
              const active = code === locale;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLocale(code)}
                  aria-pressed={active}
                  className="rounded-full px-2.5 py-1 text-[0.78rem] font-semibold uppercase transition-colors duration-200"
                  style={{
                    backgroundColor: active ? "var(--o-ink)" : "transparent",
                    color: active ? "var(--o-white)" : "var(--o-muted)",
                  }}
                >
                  {code}
                </button>
              );
            })}
          </div>

          <a href="#start" className="o-btn o-btn-primary !px-5 !py-2.5 !text-[0.9rem]">
            {orbita.getApp}
          </a>
        </div>
      </div>
    </header>
  );
}

function OrbitaFooter() {
  const copy = useCopy();
  const footer = copy.orbitaCase.footer;

  return (
    <footer className="o-band-ink">
      <div className="o-wrap py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <OrbitaLogo tone="white" />
            <p className="o-small mt-4 max-w-[30ch]" style={{ color: "#8b939f" }}>
              {footer.tagline}
            </p>
          </div>

          {footer.columns.map((column) => (
            <div key={column.key}>
              <p
                className="text-[0.8rem] font-semibold tracking-[0.04em] uppercase"
                style={{ color: "var(--o-white)" }}
              >
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link}>
                    <span className="o-small" style={{ color: "#8b939f" }}>
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-14 flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderTop: "1px solid rgb(255 255 255 / 0.1)" }}
        >
          <p className="o-small max-w-[62ch]" style={{ color: "#6f7783" }}>
            {footer.legal}
          </p>
          {/* The single nod to the studio on the whole page, and it is a
              footnote by design. */}
          <a
            href="/#work"
            className="o-small shrink-0 transition-colors duration-200"
            style={{ color: "#6f7783" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#aab2be")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6f7783")}
          >
            {footer.credit}
          </a>
        </div>
      </div>
    </footer>
  );
}
