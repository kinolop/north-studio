import type { Metadata } from "next";

import { SectionRegistry } from "@/components/chrome/SectionRegistry";
import { OrbitaCta } from "@/components/orbita/OrbitaCta";
import { OrbitaHero } from "@/components/orbita/OrbitaHero";
import { OrbitaNorth } from "@/components/orbita/OrbitaNorth";
import { OrbitaProduct } from "@/components/orbita/OrbitaProduct";
import { OrbitaShift } from "@/components/orbita/OrbitaShift";
import { OrbitaTrust } from "@/components/orbita/OrbitaTrust";
import { SectionSeam } from "@/components/ui/Section";
import { ORBITA_SECTIONS } from "@/lib/sections";
import { STUDIO } from "@/lib/studio";

export const metadata: Metadata = {
  title: "ORBITA — a brand and a landing, designed and built by North",
  description:
    "ORBITA is an invented fintech brand: mark, art direction, motion system, copy and code, made end to end so our site work can be judged on a whole brand rather than a screenshot. A demo concept by North Studio.",
  openGraph: {
    type: "article",
    siteName: STUDIO.name,
    title: "ORBITA — a brand and a landing, designed and built by North",
    description:
      "A whole fintech brand, invented and built end to end. A demo concept by North Studio.",
  },
};

/**
 * The ORBITA case: the third product page, and the one that argues for the
 * sites rather than the software.
 *
 * It is structured as the fictional product's own landing rather than as a
 * case study about one, because a case study describes work and a landing
 * *is* the work. The studio only speaks twice — the frame at the top and
 * the note near the bottom — and everything between them belongs to a
 * brand that does not exist.
 */
export default function OrbitaPage() {
  return (
    <>
      <SectionRegistry sections={ORBITA_SECTIONS} />
      <OrbitaHero />
      <OrbitaShift />
      <SectionSeam />
      <OrbitaProduct />
      <OrbitaTrust />
      <OrbitaNorth />
      <OrbitaCta />
    </>
  );
}
