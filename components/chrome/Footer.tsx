"use client";

import { useCopy } from "@/components/i18n/CopyProvider";
import { scrollToSection } from "@/components/motion/SmoothScroll";
import { CHANNELS, FOUNDER_EMAIL } from "@/lib/channels";
import { SECTIONS } from "@/lib/sections";
import { STUDIO } from "@/lib/studio";

/**
 * The footer carries the full section list, because the header nav is
 * trimmed to four items and disappears below `lg`.
 *
 * The old "Elsewhere" column linked to profile pages; it now lists the same
 * three direct channels as the rest of the site. A studio this size is
 * reached by message, not followed.
 */
export function Footer() {
  const copy = useCopy();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-hairline">
      <div className="container-north py-section-tight">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <p className="text-chrome font-display text-[clamp(2.5rem,6vw,4rem)] leading-none font-semibold tracking-[-0.04em] [font-variation-settings:'wdth'_116]">
              {STUDIO.wordmarkFull}
            </p>
            <p className="mt-8 max-w-[34ch] text-body text-ash">
              {copy.footer.colophon}
            </p>
            <a
              href={`mailto:${FOUNDER_EMAIL}`}
              className="mt-8 inline-block text-lead text-bone underline decoration-hairline decoration-1 underline-offset-[6px] transition-colors duration-[var(--duration-state)] ease-[var(--ease-north)] hover:decoration-signal"
            >
              {FOUNDER_EMAIL}
            </a>
          </div>

          <nav aria-label={copy.footer.index} className="lg:col-span-4">
            <p className="label-mono">{copy.footer.index}</p>
            <ul className="mt-7 grid grid-cols-2 gap-x-8 gap-y-3.5">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={(event) => {
                      event.preventDefault();
                      scrollToSection(section.id);
                    }}
                    className="group flex items-baseline gap-3 text-meta text-ash transition-colors duration-[var(--duration-state)] hover:text-bone"
                  >
                    <span className="label-mono text-hairline transition-colors duration-[var(--duration-state)] group-hover:text-signal">
                      {section.bearing}
                    </span>
                    {copy.sections[section.id]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className="label-mono">{copy.footer.elsewhere}</p>
            <ul className="mt-7 space-y-3.5">
              {CHANNELS.map((channel) => (
                <li key={channel.id}>
                  <a
                    href={channel.href}
                    {...(channel.external
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                    className="group flex flex-col gap-1"
                  >
                    <span className="text-meta text-ash transition-colors duration-[var(--duration-state)] group-hover:text-bone">
                      {copy.channels.labels[channel.id]}
                    </span>
                    <span className="label-mono text-hairline transition-colors duration-[var(--duration-state)] group-hover:text-signal-lift">
                      {channel.handle}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-8">
          <p className="label-mono">
            © {year} {STUDIO.name}
          </p>
          <p className="label-mono">{copy.footer.place}</p>
        </div>
      </div>
    </footer>
  );
}
