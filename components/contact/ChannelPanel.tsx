"use client";

import { useCopy } from "@/components/i18n/CopyProvider";
import { Reveal } from "@/components/ui/Reveal";
import { CHANNELS } from "@/lib/channels";

import { ChannelIcon } from "./ChannelIcon";

/**
 * The three direct channels, sitting under the primary button.
 *
 * This is a conversion surface, not a row of social icons: each card shows
 * the actual handle, so a visitor can copy it or recognise it without
 * committing to a click. Same data source as the overlay — one place to
 * change a number.
 */
export function ChannelPanel() {
  const copy = useCopy();

  return (
    <div className="w-full">
      <p className="label-mono flex items-center justify-center gap-3">
        <span aria-hidden className="h-px w-8 bg-hairline" />
        {copy.cta.directLabel}
        <span aria-hidden className="h-px w-8 bg-hairline" />
      </p>

      <ul className="mt-7 grid gap-3 sm:grid-cols-3">
        {CHANNELS.map((channel, index) => (
          <Reveal key={channel.id} delay={index * 0.07}>
            <li className="glass glass-edge h-full overflow-hidden transition-[border-color,transform] duration-[420ms] ease-[var(--ease-north)] hover:-translate-y-0.5 hover:border-signal/30">
              <a
                href={channel.href}
                {...(channel.external
                  ? { target: "_blank", rel: "noreferrer noopener" }
                  : {})}
                className="group flex h-full flex-col items-start gap-4 p-6 text-left"
              >
                <span className="flex w-full items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline text-ash transition-[color,border-color] duration-[var(--duration-state)] ease-[var(--ease-north)] group-hover:border-signal/45 group-hover:text-signal-lift">
                    <ChannelIcon id={channel.id} className="h-[18px] w-[18px]" />
                  </span>
                  <span className="text-meta text-bone">
                    {copy.channels.labels[channel.id]}
                  </span>
                </span>

                <span className="data-mono w-full truncate text-signal-lift">
                  {channel.handle}
                </span>

                <span className="text-meta text-ash">
                  {copy.channels.notes[channel.id]}
                </span>
              </a>
            </li>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
