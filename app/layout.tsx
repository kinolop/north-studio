import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono, Golos_Text } from "next/font/google";

import { Atmosphere } from "@/components/atmosphere/Atmosphere";
import { ChannelOverlayProvider } from "@/components/contact/ChannelOverlayProvider";
import { CompassHUD } from "@/components/chrome/CompassHUD";
import { Footer } from "@/components/chrome/Footer";
import { Header } from "@/components/chrome/Header";
import { Preloader } from "@/components/chrome/Preloader";
import { ScrollRail } from "@/components/chrome/ScrollRail";
import { SoundToggle } from "@/components/chrome/SoundToggle";
import { StudioChrome } from "@/components/chrome/StudioChrome";
import { CopyProvider } from "@/components/i18n/CopyProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { SITE_URL, STUDIO } from "@/lib/studio";

import "./globals.css";

/**
 * Display face. Archivo is a variable grotesk with a `wdth` axis — pushed
 * wide it reads machined at hero sizes, and it separates the display voice
 * from the body voice by width rather than by genre.
 */
const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

/**
 * The display face for Cyrillic.
 *
 * Archivo has no Cyrillic, and the alternative — replacing it with a face
 * that covers both — would cost the `wdth` axis the whole display voice is
 * built on. So the stack is layered instead: Latin resolves to Archivo,
 * Cyrillic falls through to Golos, a grotesk actually drawn for Cyrillic
 * rather than a Latin face with Cyrillic bolted on. Two scripts, two faces
 * chosen for them, one voice.
 */
const golos = Golos_Text({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-golos",
});

/**
 * Cyrillic is not optional here: the site ships a full Russian locale, and
 * without the subset every heading and paragraph in RU would fall back to
 * a system face and lose the type design entirely.
 */
const geist = Geist({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-geist-mono",
});

const description =
  "North Studio is a founder-led digital studio. We design and build cinematic websites for ambitious small businesses — in weeks, not quarters.";

export const metadata: Metadata = {
  // Every relative URL in this file and in every page's metadata resolves
  // against this, so the canonical host is stated once and inherited.
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: {
    default: `${STUDIO.name} — We make small companies look inevitable`,
    template: `%s — ${STUDIO.name}`,
  },
  description,
  applicationName: STUDIO.name,
  keywords: [
    "design studio",
    "web design",
    "cinematic websites",
    "founder-led studio",
    "premium web development",
  ],
  authors: [{ name: STUDIO.name }],
  creator: STUDIO.name,
  openGraph: {
    type: "website",
    siteName: STUDIO.name,
    url: "/",
    title: `${STUDIO.name} — We make small companies look inevitable`,
    description,
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: `${STUDIO.name} — We make small companies look inevitable`,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#07080b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${golos.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <head>
        {/* The intro is server-rendered so the hero never flashes behind it.
            Without JS it would then never dismiss, so no-JS removes it. */}
        <noscript>
          <style>{`.north-preloader{display:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <a
          href="#origin"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:rounded-[var(--radius-control)] focus:bg-riser focus:px-4 focus:py-2 focus:text-meta focus:text-bone"
        >
          Skip to content
        </a>

        <CopyProvider>
          <ChannelOverlayProvider>
            <SmoothScroll>
              {/* Everything inside StudioChrome is North Studio's own
                  identity. The ORBITA case is a different company with a
                  light theme of its own, so it renders bare — see
                  components/chrome/StudioChrome.tsx. */}
              <StudioChrome>
                <Atmosphere />
                <Header />
              </StudioChrome>

              {/* Section-aware chrome. `/privacy` is a studio page but has
                  no bearings to point at, so the instruments sit it out —
                  see QUIET_ROUTES in StudioChrome. */}
              <StudioChrome instruments>
                <Preloader />
                <ScrollRail />
                <CompassHUD />
              </StudioChrome>

              <main id="main">{children}</main>

              <StudioChrome>
                <Footer />
              </StudioChrome>

              <StudioChrome instruments>
                <SoundToggle />
              </StudioChrome>
            </SmoothScroll>
          </ChannelOverlayProvider>
        </CopyProvider>
      </body>
    </html>
  );
}
