"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCopy } from "@/components/i18n/CopyProvider";
import { LocaleSwitch } from "@/components/i18n/LocaleSwitch";
import { ScrambleLabel } from "@/components/motion/ScrambleLabel";
import { scrollToSection } from "@/components/motion/SmoothScroll";
import { CHANNELS } from "@/lib/channels";
import { SECTIONS } from "@/lib/sections";
import { LEGAL, STUDIO } from "@/lib/studio";

import { FitLine } from "./FitLine";
import { LogoMark } from "./Logo";
import { RollText } from "./RollText";

/**
 * The colophon. The mark and the name return at the foot of the sheet, set
 * edge to edge and cut by the bottom of the page like a masthead printed
 * past the trim.
 */
export function PaperFooter() {
  const copy = useCopy();
  const atHome = usePathname() === "/";
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden">
      <div className="sheet pt-14 lg:pt-20">
        <div className="sheet-grid gap-y-10 border-t-2 border-ink pt-10">
          <div className="col-span-12 md:col-span-5">
            <p className="max-w-[32ch] text-[clamp(1.2rem,1.6vw,1.5rem)] leading-[1.3] font-semibold text-ink">
              {copy.footer.colophon}
            </p>
            <p className="mt-3 text-copy text-ink-soft">{copy.footer.place}</p>
          </div>

          <nav aria-label={copy.footer.index} className="col-span-6 md:col-span-3 md:col-start-7">
            <ScrambleLabel text={copy.footer.index} className="mark block text-cobalt" />
            <ul className="mt-4 space-y-2">
              {SECTIONS.filter((section) => section.id !== "origin").map((section) => (
                <li key={section.id}>
                  <Link
                    href={`/#${section.id}`}
                    onClick={(event) => {
                      if (!atHome) return;
                      event.preventDefault();
                      scrollToSection(section.id);
                    }}
                    className="group inline-block text-copy text-ink hover:text-cobalt"
                  >
                    <RollText text={copy.sections[section.id]} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-6 md:col-span-3">
            <ScrambleLabel text={copy.footer.elsewhere} className="mark block text-cobalt" />
            <ul className="mt-4 space-y-2">
              {CHANNELS.map((channel) => (
                <li key={channel.id}>
                  <a
                    href={channel.href}
                    {...(channel.external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                    className="group inline-block text-copy text-ink hover:text-cobalt"
                  >
                    <RollText text={copy.channels.labels[channel.id]} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-rule pt-5 text-small text-ink-soft">
          <p>
            © {year} {STUDIO.name}
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <span>{LEGAL.entity}</span>
            <span className="tabular-nums">
              {LEGAL.innLabel} {LEGAL.inn}
            </span>
            <Link href={LEGAL.privacyPath} className="ink-link hover:text-ink">
              {copy.footer.privacy}
            </Link>
          </p>
          {/* The header drops the switch on phones for room; it lives here too. */}
          <LocaleSwitch tone="paper" />
          <button
            type="button"
            onClick={() => scrollToSection("main")}
            className="group font-semibold text-ink hover:text-cobalt"
          >
            <RollText text={copy.footer.top} />
          </button>
        </div>
      </div>

      <div aria-hidden className="sheet mt-10 -mb-[2.4vw] select-none">
        <FitLine as="div" fallback="13vw" className="text-ink" ariaHidden>
          <span className="inline-flex items-center gap-[0.12em] leading-[0.9] font-extrabold tracking-[-0.055em]">
            <LogoMark className="h-[0.74em] w-[0.74em]" />
            {STUDIO.name}
          </span>
        </FitLine>
      </div>
    </footer>
  );
}
