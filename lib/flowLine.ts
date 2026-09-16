import type { FlowChannel } from "./i18n/types";

/**
 * The North Flow demo's brain.
 *
 * In the product this is a model reading the enquiry. Here it is a short
 * list of words people actually use when they are ready to buy, and words
 * they use when they are only looking, in both languages. Small on purpose:
 * the page says it is a demo, and a visitor typing something unexpected
 * gets a sensible "normal" enquiry rather than a wrong confident label.
 */

export type Tone = "warm" | "cold";
export type Priority = "high" | "normal" | "low";

const URGENT =
  /срочн|сегодня|завтра|к пятниц|до выходн|оплач|оплат|сч[её]т|urgent|today|tomorrow|by friday|before the weekend|pay|invoice|asap/i;

const WARM =
  /оформ|заказ|купить|куплю|нужн|нужен|хочу|перезвон|пропущенн|доставк|опт|посмотреть .* в\sшоурум|сколько стоит|сроки|размер|скол|вернуть|order|buy|need|want|call me|missed call|deliver|wholesale|showroom|how long|dimension|chipped|return/i;

const COLD =
  /просто|смотрю|каталог|дешевле|торг|актуальн|позже|подума|just|brows|looking around|catalogue|catalog|discount|negotiab|still available|later|think/i;

export interface Verdict {
  tone: Tone;
  priority: Priority;
}

export function qualify(text: string): Verdict {
  const cold = COLD.test(text);
  const warm = WARM.test(text) || URGENT.test(text);
  if (cold && !URGENT.test(text)) return { tone: "cold", priority: "low" };
  if (URGENT.test(text)) return { tone: "warm", priority: "high" };
  if (warm) return { tone: "warm", priority: "normal" };
  return { tone: "warm", priority: "normal" };
}

/** One enquiry travelling the line in the interactive demo. */
export interface LineLead {
  id: number;
  channel: FlowChannel;
  text: string;
  /** Sent by the visitor rather than by the line's own sample stream. */
  mine: boolean;
  tone: Tone;
  priority: Priority;
  /** Manager index, or -1 for the nurture list. */
  route: number;
  /** 0 intake, 1 tagging, 2 manager, 3 CRM, 4 filed. */
  stage: number;
  at: Date;
  /** Index into the hero's enquiries, for the ones the hero already filed. */
  seed?: number;
}

export const STATION_COUNT = 4;

/** How long a lead rests on each station. */
export const STATION_MS = 950;
