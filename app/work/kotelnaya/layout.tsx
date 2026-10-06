import type { Viewport } from "next";
import { Brygada_1918, Commissioner, PT_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { KotelnayaShell } from "@/components/kotelnaya/KotelnayaShell";

/**
 * «Котельная»'s faces. None of them is used anywhere else on the studio's site.
 *
 * Brygada 1918 for the headings: a revival of a book face cut the decade
 * the boiler house was built, with the warm, slightly uneven serifs of
 * metal type. It is the building's voice.
 *
 * Commissioner for everything read, plain and open at small sizes on a
 * phone in a queue.
 *
 * PT Mono for times and prices: the hand of a boiler-room log and of a
 * bakery's chalked timetable, and a Russian face for a Russian place.
 */
const brygada = Brygada_1918({
  subsets: ["latin", "cyrillic"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-brygada",
});

const commissioner = Commissioner({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-commissioner",
});

const ptMono = PT_Mono({
  subsets: ["latin", "cyrillic"],
  weight: "400",
  display: "swap",
  variable: "--font-ptmono",
});

export const viewport: Viewport = {
  themeColor: "#ecebe6",
  colorScheme: "light",
};

export default function KotelnayaLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${brygada.variable} ${commissioner.variable} ${ptMono.variable}`}>
      <KotelnayaShell>{children}</KotelnayaShell>
    </div>
  );
}
