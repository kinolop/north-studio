import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { OrbitaSite } from "@/components/orbita/OrbitaSite";

/**
 * ORBITA's own typeface.
 *
 * Loaded here rather than in the root layout so it ships with this route
 * only. Inter is deliberately not the studio's Archivo: warm, neutral and
 * friendly where the studio's display face is expanded and machined.
 */
const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  // `absolute` so the studio's "— North Studio" template does not
  // append itself to a page that is presenting another company.
  title: { absolute: "Orbita — your money, finally in one orbit" },
  description:
    "Orbita brings every bank, card and wallet you already use into a single view, with instant transfers between your own accounts. A demo concept by North Studio.",
  openGraph: {
    type: "website",
    siteName: "Orbita",
    title: "Orbita — your money, finally in one orbit",
    description:
      "Every account in one view. Instant transfers. Spending explained in a sentence.",
  },
};

/**
 * The ORBITA case, and the one page on this site that is not North Studio.
 *
 * It presents an invented fintech company as that company would present
 * itself: light, warm, mint, Inter — nothing borrowed from the studio's
 * dark identity. The studio's fixed chrome is suppressed for this route in
 * `StudioChrome`, and the styling is scoped under `.orbita`, so the two
 * design systems cannot reach each other in either direction.
 */
export default function OrbitaPage() {
  return (
    <div className={inter.variable}>
      <OrbitaSite />
    </div>
  );
}
