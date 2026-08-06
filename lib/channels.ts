/**
 * Every way to reach the studio, in one place.
 *
 * The channel chooser, the panel under the CTA and the brief form all read
 * from here. Three copies of a phone number is three chances for one of
 * them to be wrong after a change.
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

/** Where the brief form delivers. Same address as the email channel. */
export const FOUNDER_EMAIL = "danskr2008@gmail.com";

/**
 * Reserved for a prefilled greeting on Telegram/WhatsApp deep links.
 *
 * Deliberately empty and unused: every channel opens clean for now. To turn
 * it on later, append `?text=${encodeURIComponent(PREFILLED_GREETING)}` to
 * the telegram and whatsapp hrefs — both accept that parameter. Do not
 * apply it to mailto, which needs `?body=` instead.
 */
export const PREFILLED_GREETING = "";
