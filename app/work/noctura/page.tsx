import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { NocturaSite } from "@/components/noctura/NocturaSite";

/**
 * NOCTURA's display face.
 *
 * Cormorant Garamond, and Cyrillic is not optional: this page is Russian
 * only, and without the subset every headline on it would fall back to a
 * system serif and lose the entire type design. It is a high-contrast
 * garalde with genuinely fine hairlines - which is why the stylesheet sets
 * it a weight heavier and a size larger than the same scale would call for
 * on white, and never below 300.
 *
 * Deliberately neither the studio's Archivo nor ORBITA's Inter. Three
 * brands on this site, three faces.
 */
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

/**
 * The body face. A modern grotesk drawn with real Cyrillic rather than a
 * Latin face with Cyrillic bolted on, warm enough not to fight the serif
 * and quiet enough to carry three-paragraph passages.
 */
const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-manrope",
});

const description =
  "NOCTURA - пятизвёздочный отель на сорока двух этажах над ночным городом: номера с панорамой, термальный спа в каменном подвале и ресторан, который открывается в полночь. Демо-концепт студии North Studio.";

export const metadata: Metadata = {
  // `absolute`, so the studio's "— North Studio" template does not append
  // itself to a page that is presenting another brand.
  title: { absolute: "NOCTURA - отель, в котором ночь принадлежит вам" },
  description,
  openGraph: {
    type: "website",
    siteName: "NOCTURA",
    title: "NOCTURA - отель, в котором ночь принадлежит вам",
    description,
    locale: "ru_RU",
    images: [{ url: "/work/noctura/assets/cover.png", width: 1280, height: 704 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NOCTURA - отель, в котором ночь принадлежит вам",
    description,
  },
};

/**
 * The NOCTURA case: a five-star hotel that does not exist, presented the
 * way it would present itself.
 *
 * Russian only and no language switch, on purpose - a Moscow hotel with an
 * EN/RU toggle in the corner would be a studio page wearing a hotel's
 * clothes. The styling is scoped under `.noctura` and the studio's chrome is
 * suppressed for this route in `StudioChrome`, so the three design systems
 * on this site cannot reach each other in any direction.
 */
export default function NocturaPage() {
  return (
    <div className={`${cormorant.variable} ${manrope.variable}`} lang="ru">
      <NocturaSite />
    </div>
  );
}
