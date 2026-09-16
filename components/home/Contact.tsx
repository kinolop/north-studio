"use client";

import { useChannelOverlay } from "@/components/contact/ChannelOverlayProvider";
import { useCopy } from "@/components/i18n/CopyProvider";
import { PrintLines } from "@/components/motion/PrintLines";
import { TypeText } from "@/components/motion/TypeText";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { CHANNELS, TELEGRAM_CHANNEL } from "@/lib/channels";

import { InkButton } from "./InkButton";

const STRIPES = 7;

/**
 * The close, printed on a sheet of solid cobalt: the one place the accent
 * takes the whole page, so the invitation cannot be scrolled past.
 *
 * The invitation itself is the button. Reaching for it runs paper stripes
 * in from alternate sides until the type stands on paper, the same bands
 * the loader ruled its sheet with.
 */
export function Contact() {
  const copy = useCopy();
  const { open } = useChannelOverlay();

  return (
    <Section id="start" flush className="bg-cobalt pt-10 pb-16 text-paper lg:pt-14 lg:pb-20">
      <div className="sheet">
        <button
          type="button"
          onClick={() => open()}
          className="group relative isolate block w-full overflow-hidden text-left"
        >
          {Array.from({ length: STRIPES }, (_, i) => (
            <span
              key={i}
              aria-hidden
              className={`absolute inset-x-0 -z-10 scale-x-0 bg-paper transition-[scale] duration-700 ease-[var(--ease-print)] group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none ${i % 2 === 0 ? "origin-left" : "origin-right"}`}
              style={{
                top: `${(i * 100) / STRIPES}%`,
                height: `${100 / STRIPES + 0.5}%`,
                transitionDelay: `${i * 40}ms`,
              }}
            />
          ))}
          <TypeText
            as="span"
            lines={copy.cta.title}
            speed={52}
            caretClassName="bg-paper group-hover:bg-cobalt"
            className="poster block px-1 py-2 text-[clamp(3.6rem,12vw,13rem)] text-paper transition-colors duration-500 group-hover:text-cobalt group-focus-visible:text-cobalt"
          />
        </button>

        <div className="sheet-grid mt-12 gap-y-10 border-t border-paper/60 pt-8">
          <Reveal className="col-span-12 lg:col-span-5">
            <PrintLines
              text={copy.cta.lede}
              className="max-w-[38ch] text-[clamp(1.2rem,1.6vw,1.5rem)] leading-[1.35] text-paper"
            />
            <div className="mt-8">
              <InkButton tone="paper" onClick={() => open()}>
                {copy.cta.action}
              </InkButton>
            </div>
          </Reveal>

          <ul className="col-span-12 grid gap-y-6 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {CHANNELS.map((channel) => (
              <li key={channel.id} className="border-t border-paper/30 pt-4 sm:pr-6">
                <p className="mark text-paper/75">{copy.channels.labels[channel.id]}</p>
                <a
                  href={channel.href}
                  {...(channel.external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                  className="ink-link-paper mt-2 inline-block text-[clamp(1.1rem,1.4vw,1.35rem)] font-semibold break-all text-paper"
                >
                  {channel.handle}
                </a>
              </li>
            ))}
            <li className="border-t border-paper/30 pt-4">
              <p className="mark text-paper/75">{copy.cta.channel}</p>
              <a
                href={TELEGRAM_CHANNEL.href}
                target="_blank"
                rel="noreferrer noopener"
                className="ink-link-paper mt-2 inline-block text-[clamp(1.1rem,1.4vw,1.35rem)] font-semibold text-paper"
              >
                {TELEGRAM_CHANNEL.handle}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </Section>
  );
}
