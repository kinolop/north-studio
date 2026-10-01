import type { Viewport } from "next";
import { EB_Garamond, JetBrains_Mono, Sofia_Sans, Sofia_Sans_Extra_Condensed } from "next/font/google";
import type { ReactNode } from "react";

import { MarshrutShell } from "@/components/marshrut/MarshrutShell";

/**
 * МАРШРУТ's faces. None of them is used anywhere else on the studio's site.
 *
 * Sofia Sans for everything that is read. It was drawn for Cyrillic first and
 * has the plain, slightly technical manner of a timetable, which is the
 * register a freight forwarder should have.
 *
 * Sofia Sans Extra Condensed for the numbers and the big words. Very tall, very
 * narrow, at heavy weights it is the lettering on a railway wagon or a
 * container door: the price and the days are the two things the page exists
 * to say, and they should look stencilled rather than typeset.
 *
 * JetBrains Mono for figures that have to be compared and for the ruler, and
 * EB Garamond in italic for the names on the map alone. Atlases have set
 * seas and countries in old-style italic for two hundred years, and it is
 * the one place on the page where a serif is the right answer rather than
 * the easy one.
 */
const sofia = Sofia_Sans({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-sofia",
});

const sofiaCondensed = Sofia_Sans_Extra_Condensed({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-sofia-xc",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-jbmono",
});

const garamond = EB_Garamond({
  subsets: ["latin", "cyrillic"],
  style: "italic",
  display: "swap",
  variable: "--font-garamond",
});

// The page is night throughout, the browser chrome with it.
export const viewport: Viewport = {
  themeColor: "#0c0d0f",
  colorScheme: "dark",
};

export default function MarshrutLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${sofia.variable} ${sofiaCondensed.variable} ${mono.variable} ${garamond.variable}`}
    >
      <MarshrutShell>{children}</MarshrutShell>
    </div>
  );
}
