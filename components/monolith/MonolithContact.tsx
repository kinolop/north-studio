"use client";

import { useCopy } from "@/components/i18n/CopyProvider";
import { MONOLITH } from "@/lib/monolith";

import { MonolithLocale } from "./MonolithLocale";
import { MonolithReveal } from "./MonolithReveal";

/**
 * The last pour, and the darkest.
 *
 * The light has not moved: the shadow is still at the top left and the lit
 * lip still at the bottom right, they have only changed value — on a dark
 * slab the recess wall goes to near-black and the lip is a sheen rather than
 * a white edge. Everything else here is the same press it was six sections
 * ago.
 *
 * The four contacts are set flat rather than debossed. They are the one
 * thing on the page somebody has to be able to copy down.
 *
 * The language switch is repeated here because the one in the hero scrolls
 * away with it — the page carries no fixed bar, and a strip of chrome
 * floating over a concrete surface would be the only thing on it that is
 * not part of the wall.
 */
export function MonolithContact() {
  const contact = useCopy().monolithCase.contact;

  const rows = [
    { key: "studio", label: contact.studioLabel, value: contact.address },
    { key: "mail", label: contact.mailLabel, value: MONOLITH.mail, href: `mailto:${MONOLITH.mail}` },
    { key: "phone", label: contact.phoneLabel, value: MONOLITH.phone, href: `tel:${MONOLITH.phone.replace(/[^+\d]/g, "")}` },
    { key: "hours", label: contact.hoursLabel, value: contact.hours },
  ] as const;

  return (
    <section className="mn-s-15 mn-section">
      <div className="mn-wrap">
        <MonolithReveal distance={0}>
          <p className="mn-mono mn-deboss-fine">{contact.label}</p>
        </MonolithReveal>

        <MonolithReveal delay={100}>
          <p className="mn-display mn-deboss mt-[clamp(2rem,6vh,3.5rem)] max-w-[20ch]">
            {contact.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </MonolithReveal>

        <div aria-hidden className="mn-groove mt-[clamp(3rem,9vh,6rem)]" />

        <MonolithReveal delay={80}>
          <dl className="grid gap-x-[clamp(1.5rem,3vw,3rem)] gap-y-[clamp(2rem,4vh,3rem)] pt-[clamp(2.5rem,6vh,4rem)] sm:grid-cols-2 lg:grid-cols-4">
            {rows.map((row) => (
              <div key={row.key}>
                <dt className="mn-mono mn-deboss-fine">{row.label}</dt>
                <dd className="mn-body mt-4 max-w-[28ch]">
                  {"href" in row && row.href ? (
                    <a className="mn-link" href={row.href}>
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </MonolithReveal>

        <div aria-hidden className="mn-groove mt-[clamp(3.5rem,10vh,7rem)]" />

        <div className="flex flex-col gap-x-10 gap-y-8 pt-[clamp(2rem,5vh,3rem)] lg:flex-row lg:items-start lg:justify-between">
          <p className="mn-body max-w-[64ch] opacity-80">{contact.legal}</p>

          <div className="flex shrink-0 flex-col gap-4 lg:items-end">
            <MonolithLocale />

            {/* The single nod to the studio on the whole page, and it is a
                footnote by design.

                A plain anchor rather than next/link, and the same one the
                ORBITA and NOCTURA cases use: leaving a foreign brand should
                be a hard navigation. A client-side hop would keep this
                page's fonts and body colour mounted while the studio's dark
                identity paints under them, and would land the hash scroll
                inside Lenis mid-transition. A full load boots the home page
                clean. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/#work" className="mn-link mn-mono">
              {contact.backToStudio}
            </a>

            <p className="mn-mono mn-deboss-fine">{contact.credit}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
