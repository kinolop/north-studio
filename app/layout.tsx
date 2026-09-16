import type { Metadata, Viewport } from "next";
import {
  Caveat,
  Martian_Mono,
  Sofia_Sans,
  Sofia_Sans_Extra_Condensed,
} from "next/font/google";

import { ChannelOverlayProvider } from "@/components/contact/ChannelOverlayProvider";
import { StudioChrome } from "@/components/chrome/StudioChrome";
import { CopyProvider } from "@/components/i18n/CopyProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { SITE_URL, STUDIO } from "@/lib/studio";

import "./globals.css";

/**
 * The studio's three voices. Sofia Sans was drawn with Cyrillic as a first
 * language rather than an afterthought, and its extra-condensed cut runs
 * from hairline to black on one axis: that range is the whole poster voice.
 */
const sofiaExtraCondensed = Sofia_Sans_Extra_Condensed({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-sofia-xc",
});

const sofia = Sofia_Sans({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-sofia",
});

const martian = Martian_Mono({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-martian",
});

/** The editor's pen: corrections written over the hero, and a signature. */
const caveat = Caveat({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-caveat",
});

const title = `${STUDIO.name} - сайты, AI-агенты и автоматизация`;
const description =
  "Авторская студия: сайты, которые приводят клиентов, AI-агенты, которые им отвечают, и автоматизация, которая доводит заявку до CRM.";

export const metadata: Metadata = {
  // Every relative URL in this file and in every page's metadata resolves
  // against this, so the canonical host is stated once and inherited.
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: {
    default: title,
    template: `%s - ${STUDIO.name}`,
  },
  description,
  applicationName: STUDIO.name,
  keywords: [
    "разработка сайтов",
    "дизайн сайтов",
    "AI-агент для бизнеса",
    "автоматизация заявок",
    "авторская студия",
  ],
  authors: [{ name: STUDIO.name }],
  creator: STUDIO.name,
  openGraph: {
    type: "website",
    siteName: STUDIO.name,
    url: "/",
    title,
    description,
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ecebe6",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // `lang` matches DEFAULT_LOCALE and is what the server actually
    // sends; CopyProvider rewrites it on the client after a switch.
    <html
      lang="ru"
      className={`${sofiaExtraCondensed.variable} ${sofia.variable} ${martian.variable} ${caveat.variable}`}
      // The loader adds `intro-running` before hydration finishes.
      suppressHydrationWarning
    >
      <head>
        {/* The loader is server-rendered so the page never flashes behind
            it. Without JS it would never dismiss, so no-JS removes it. */}
        <noscript>
          <style>{`.north-intro,.north-intro+div{display:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Перейти к содержанию
        </a>

        <CopyProvider>
          <ChannelOverlayProvider>
            <SmoothScroll>
              <StudioChrome>{children}</StudioChrome>
            </SmoothScroll>
          </ChannelOverlayProvider>
        </CopyProvider>
      </body>
    </html>
  );
}
