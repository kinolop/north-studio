"use client";

import { useEffect, useState } from "react";

import { NOCTURA_SECTIONS } from "@/lib/noctura";

/**
 * The floor indicator, fixed to the left edge.
 *
 * This is the page's structural device, and it is not decoration: NOCTURA
 * is a forty-two floor tower and every section really is on the floor it
 * prints. The spa is in the stone basement, so it reads -2. The rooms climb
 * 12 to 40. The restaurant is on 41 and the view is from 42. Scrolling the
 * page is riding the building, and the rail is the panel above the doors
 * telling you where you are.
 *
 * Marked `aria-hidden` deliberately. It duplicates information the section
 * headings already carry, and a screen reader announcing "floor minus two"
 * every time the viewport crosses a boundary would be noise, not help. The
 * real navigation lives in the header.
 */
export function NocturaTower() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const sections = NOCTURA_SECTIONS.map((section) =>
      document.getElementById(section.id),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        // The section occupying the middle band of the viewport wins. Taking
        // the *last* intersecting one going down means the rail changes as a
        // section's top passes the band, not as its bottom leaves it.
        const hit = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => sections.indexOf(entry.target as HTMLElement))
          .filter((index) => index >= 0);

        if (hit.length > 0) setActive(Math.max(...hit));
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const current = NOCTURA_SECTIONS[active] ?? NOCTURA_SECTIONS[0];

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed top-1/2 left-6 z-30 hidden -translate-y-1/2 xl:block"
    >
      <div className="flex items-center gap-4">
        {/* The shaft: one tick per floor the page visits, the current one
            lit. Short ticks so the rail reads as an instrument. */}
        <div className="flex flex-col items-center gap-2.5">
          {NOCTURA_SECTIONS.map((section, index) => (
            <span
              key={section.id}
              style={{
                display: "block",
                width: index === active ? "14px" : "8px",
                height: "1px",
                backgroundColor:
                  index === active ? "var(--n-gold)" : "var(--n-line)",
                boxShadow:
                  index === active
                    ? "0 0 10px 0 rgb(200 169 106 / 0.6)"
                    : "none",
                transition:
                  "width 620ms var(--n-lift), background-color 620ms var(--n-ease), box-shadow 620ms var(--n-ease)",
              }}
            />
          ))}
        </div>

        <div style={{ minWidth: "5.5rem" }}>
          <p
            className="n-label"
            style={{ fontSize: "0.5625rem", letterSpacing: "0.3em" }}
          >
            Этаж
          </p>
          <p
            key={current.floor}
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "1.5rem",
              lineHeight: 1.1,
              color: "var(--n-champagne)",
              fontVariantNumeric: "tabular-nums",
              marginTop: "0.4rem",
              // Re-keyed on change, so the number fades in rather than
              // swapping. The key is the whole trick.
              animation: "n-floor-in 640ms var(--n-ease) both",
            }}
          >
            {current.floor}
          </p>
          <p
            key={`${current.id}-label`}
            className="n-small"
            style={{
              marginTop: "0.1rem",
              color: "var(--n-ash)",
              animation: "n-floor-in 640ms var(--n-ease) 60ms both",
            }}
          >
            {current.label}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes n-floor-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes n-floor-in {
            from { opacity: 1; transform: none; }
            to   { opacity: 1; transform: none; }
          }
        }
      `}</style>
    </div>
  );
}
