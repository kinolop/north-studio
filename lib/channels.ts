/**
 * Every way to reach the studio, in one place.
 *
 * The channel chooser and the panel under the CTA both read from here.
 * Two copies of a phone number is two chances for one of them to be wrong
 * after a change.
 *
 * Copy (labels, one-line notes) is NOT here — it lives in the dictionaries
 * so it can be translated. This file holds only what never changes between
 * locales: the identity of each channel and where it points.
 */

export type ChannelId = "telegram" | "whatsapp" | "email";

export interface Channel {
  readonly id: ChannelId;
  /** Shown verbatim: the handle, number or address. Never translated. */
  readonly handle: string;
  readonly href: string;
  /** Opens an external app, so the link needs target/rel. */
  readonly external: boolean;
}

export const CHANNELS = [
  {
    id: "telegram",
    handle: "@Dahilchick",
    href: "https://t.me/Dahilchick",
    external: true,
  },
  {
    id: "whatsapp",
    handle: "+7 967 309 76 13",
    href: "https://wa.me/79673097613",
    external: true,
  },
  {
    id: "email",
    handle: "danskr2008@gmail.com",
    href: "mailto:danskr2008@gmail.com",
    external: false,
  },
] as const satisfies readonly Channel[];

/** The studio's public email. Printed in the footer. */
export const FOUNDER_EMAIL = "danskr2008@gmail.com";

/**
 * The studio's Telegram channel.
 *
 * Deliberately not in `CHANNELS`. That list answers "how do I reach a
 * person", and every entry in it is a private thread with a handle beside
 * it. A channel is the opposite: public, one-way, and something you follow
 * rather than write to. Mixing it in would have put "subscribe" in a row of
 * "message us", and the chooser would have stopped meaning one thing.
 */
export const TELEGRAM_CHANNEL = {
  href: "https://t.me/northstudio_ru",
  handle: "@northstudio_ru",
} as const;

/**
 * Reserved for a prefilled greeting on Telegram/WhatsApp deep links.
 *
 * Deliberately empty and unused: every channel opens clean for now. To turn
 * it on later, append `?text=${encodeURIComponent(PREFILLED_GREETING)}` to
 * the telegram and whatsapp hrefs — both accept that parameter. Do not
 * apply it to mailto, which needs `?body=` instead.
 */
export const PREFILLED_GREETING = "";
