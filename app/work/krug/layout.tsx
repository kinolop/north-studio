import type { Viewport } from "next";
import { IBM_Plex_Mono, Piazzolla, Ysabeau_Office } from "next/font/google";
import type { ReactNode } from "react";

import { KrugShell } from "@/components/krug/KrugShell";

/**
 * «Круг»'s faces. None of them is used anywhere else on the studio's site.
 *
 * Piazzolla for the headings. Its serifs are cut rather than bracketed, and
 * at large sizes and light weights they look incised, the way a potter
 * scratches a mark into leather-hard clay with a needle. It is kept large
 * and kept rare.
 *
 * Ysabeau Office for everything that is read: a humanist sans with a
 * written rhythm, warm without being soft, and drawn for Cyrillic as well
 * as Latin.
 *
 * IBM Plex Mono for measurements alone: centimetres, millilitres, degrees,
 * times. The figures a studio writes on a ticket that goes into the kiln.
 */
const piazzolla = Piazzolla({
  subsets: ["latin", "cyrillic"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-piazzolla",
});

const ysabeau = Ysabeau_Office({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-ysabeau",
});

const plex = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex",
});

export const viewport: Viewport = {
  themeColor: "#1b2f6e",
  colorScheme: "dark",
};

export default function KrugLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${piazzolla.variable} ${ysabeau.variable} ${plex.variable}`}>
      <KrugShell>{children}</KrugShell>
    </div>
  );
}
