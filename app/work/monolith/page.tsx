import type { Metadata } from "next";
import { JetBrains_Mono, Onest } from "next/font/google";

import { MonolithSite } from "@/components/monolith/MonolithSite";

/**
 * MONOLITH's only typeface.
 *
 * One family for the whole practice: 800 for everything pressed into the
 * surface, 400 for everything meant to be read. Loaded here rather than in
 * the root layout so it ships with this route only, and deliberately none of
 * the studio's Archivo, ORBITA's Inter or NOCTURA's Cormorant — four brands
 * on this site, four faces.
 *
 * Cyrillic is not optional: the page is Russian by default, and without the
 * subset every debossed headline on it would fall back to a system grotesk
 * and the whole type design with it. No `weight` is passed because Onest
 * ships as a variable font, so the full 100–900 axis arrives in one file
 * rather than as two static cuts.
 */
const onest = Onest({
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
  variable: "--font-onest",
});

/**
 * The service face, and nothing else. Years, types, project numbers, the
 * seal — the things a drawing letters by hand rather than sets. It never
 * carries a sentence.
 */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
  variable: "--font-mono-monolith",
});

const description =
  "MONOLITH — архитектурное бюро, работающее с монолитным бетоном: частные дома, культурные пространства и малые общественные здания. Демо-концепт студии North Studio.";

export const metadata: Metadata = {
  // `absolute`, so the studio's "— North Studio" template does not append
  // itself to a page that is presenting another practice.
  title: { absolute: "MONOLITH — архитектурное бюро" },
  description,
  alternates: { canonical: "/work/monolith" },
  openGraph: {
    type: "website",
    siteName: "MONOLITH",
    url: "/work/monolith",
    title: "MONOLITH — архитектурное бюро",
    description,
    locale: "ru_RU",
    images: [{ url: "/work/monolith/hero.webp", width: 1280, height: 712 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MONOLITH — архитектурное бюро",
    description,
  },
};

/**
 * The MONOLITH case: an architecture practice that does not exist,
 * presented the way it would present itself.
 *
 * Bilingual on the studio's existing mechanism — `CopyProvider` in the root
 * layout, Russian by default, the switch reading from the same `LOCALES` as
 * every other page. What is not shared is anything you can see: the styling
 * is scoped under `.monolith` and the studio's chrome is suppressed for this
 * route in `StudioChrome`, so the four design systems on this site cannot
 * reach each other in any direction.
 */
export default function MonolithPage() {
  return (
    <div className={`${onest.variable} ${jetbrainsMono.variable}`}>
      <MonolithSite />
    </div>
  );
}
