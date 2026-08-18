"use client";

import { useEffect } from "react";

import { NOCTURA } from "@/lib/noctura";

import { NocturaAmbience } from "./NocturaAmbience";
import { NocturaBooking } from "./NocturaBooking";
import { NocturaDining } from "./NocturaDining";
import { NocturaHeader } from "./NocturaHeader";
import { NocturaHero } from "./NocturaHero";
import { NocturaManifesto } from "./NocturaManifesto";
import { NocturaMark } from "./NocturaMark";
import { NocturaReveal } from "./NocturaReveal";
import { NocturaRooms } from "./NocturaRooms";
import { NocturaSpa } from "./NocturaSpa";
import { NocturaTower } from "./NocturaTower";
import { NocturaView } from "./NocturaView";
import { NocturaVoices } from "./NocturaVoices";

import "./noctura.css";

/**
 * NOCTURA's site, whole.
 *
 * The only thing it shares with North Studio is the route it lives on and
 * the smooth-scroll wrapper in the root layout. Everything visible is the
 * hotel's: its own stylesheet, its own faces, its own header and footer,
 * its own reveal, its own reading of what a section is. The studio's fixed
 * chrome - preloader, compass, fog, scroll rail, dark header - is
 * suppressed for this route in `StudioChrome`, so none of it renders at
 * all, and the one nod to the studio on the whole page is a line in the
 * footer.
 *
 * The order is an ascent and then a descent: the tower from the street, the
 * lobby, the rooms climbing 12 to 40, then down to the stone basement for
 * the spa, back up to 41 and 42 for the restaurant and the view, and finally
 * back to the ground floor to talk to somebody. `NocturaTower` prints the
 * floor as you go.
 */
export function NocturaSite() {
  // The document body is painted for North Studio (#07080b, faintly cool).
  // NOCTURA's ground is warmer, and without this the rubber-band overscroll
  // at either end of the page flashes the studio's colour through.
  useEffect(() => {
    const previous = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#0a0809";
    return () => {
      document.body.style.backgroundColor = previous;
    };
  }, []);

  return (
    <div className="noctura">
      <NocturaAmbience />
      <NocturaHeader />
      <NocturaTower />

      <NocturaHero />
      <NocturaManifesto />
      <NocturaRooms />
      <NocturaSpa />
      <NocturaDining />
      <NocturaView />
      <NocturaVoices />
      <NocturaBooking />

      <NocturaFooter />
    </div>
  );
}

function NocturaFooter() {
  const footer = NOCTURA.footer;
  // Duplicated so the marquee's -50% travel lands exactly on a repeat and
  // the loop has no visible seam.
  const amenities = [...footer.marquee, ...footer.marquee];

  return (
    <footer className="n-rel" style={{ backgroundColor: "rgb(8 7 9 / 0.72)" }}>
      <hr className="n-rule" />

      {/* The amenities, running. Deliberately the only thing on the page
          that moves without being asked to - a hotel's list of services is
          exactly the sort of content that should read as a ribbon rather
          than as a bulleted list. */}
      <div className="n-marquee py-8" aria-hidden>
        <div className="n-marquee-track">
          {amenities.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="n-label n-label-dim flex items-center"
              style={{ paddingInline: "1.75rem" }}
            >
              {item}
              <span
                style={{
                  marginLeft: "3.5rem",
                  width: "3px",
                  height: "3px",
                  borderRadius: "50%",
                  backgroundColor: "var(--n-gold)",
                  opacity: 0.5,
                }}
              />
            </span>
          ))}
        </div>
      </div>

      <hr className="n-rule" />

      <div className="n-wrap py-20">
        <div className="grid gap-14 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <NocturaMark size="lg" withTagline />
            <p className="n-small mt-8 max-w-[30ch]">
              {NOCTURA.view.address}, {NOCTURA.brand.city}
            </p>
          </div>

          {footer.columns.map((column) => (
            <div key={column.key}>
              <p className="n-label">{column.title}</p>
              <ul className="mt-6 list-none space-y-3.5 p-0">
                {column.links.map((link) => (
                  <li key={link}>
                    {/* Plain text, not links. These are the pages a real
                        hotel would have and this concept does not - a link
                        that goes nowhere is worse than a line that never
                        promised to. */}
                    <span className="n-small">{link}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <NocturaReveal delay={80} distance={14}>
          <div
            className="mt-20 flex flex-col gap-6 pt-9 lg:flex-row lg:items-start lg:justify-between"
            style={{ borderTop: "1px solid var(--n-line-soft)" }}
          >
            <p className="n-small max-w-[68ch]">{footer.legal}</p>

            <div className="flex shrink-0 flex-col gap-3 lg:items-end">
              <a href="/#work" className="n-link n-small">
                {footer.backToStudio}
              </a>
              <p
                className="n-label n-label-dim"
                style={{ fontSize: "0.5625rem" }}
              >
                {footer.credit}
              </p>
            </div>
          </div>
        </NocturaReveal>
      </div>
    </footer>
  );
}
