"use client";

import { useEffect } from "react";

import { MonolithApproach } from "./MonolithApproach";
import { MonolithContact } from "./MonolithContact";
import { MonolithHero } from "./MonolithHero";
import { MonolithManifesto } from "./MonolithManifesto";
import { MonolithMaterial } from "./MonolithMaterial";
import { MonolithProjects } from "./MonolithProjects";

import "./monolith.css";

/**
 * MONOLITH's site, whole.
 *
 * The only thing it shares with North Studio is the route it lives on and
 * the locale provider — which carries data, not looks. Everything visible is
 * the practice's: its own stylesheet, its own faces, its own switch, its own
 * reveal. The studio's fixed chrome — preloader, compass, fog, scroll rail,
 * dark header and footer — is suppressed for this route in `StudioChrome`,
 * so none of it renders at all, and the one nod to the studio on the whole
 * page is a line at the foot of the contact slab.
 *
 * The order is a single descent through the material, and the pours get
 * darker as it goes: the hero at --m-90, the manifesto at the palest --m-95,
 * the register back at --m-90, the principles at --m-75, the material
 * photograph at --m-75, and the contact slab at --m-15. Nothing on the page
 * moves backwards up that scale, which is what makes six flat surfaces read
 * as one wall you are walking down rather than as six sections.
 */
export function MonolithSite() {
  // The document body is painted near-black for the studio. This page is
  // concrete, and without this the rubber-band overscroll at either end of
  // the page flashes the studio's colour through.
  useEffect(() => {
    const previous = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#e9e7e3";
    return () => {
      document.body.style.backgroundColor = previous;
    };
  }, []);

  return (
    <div className="monolith">
      <MonolithHero />
      <MonolithManifesto />
      <MonolithProjects />
      <MonolithApproach />
      <MonolithMaterial />
      <MonolithContact />
    </div>
  );
}
