/**
 * The configurator's arithmetic, kept out of the component.
 *
 * Anchored to the three real tiers so the estimate can never drift away
 * from the prices published two sections above it. The output is a *range*
 * and is labelled as an estimate everywhere it appears — the studio's whole
 * pitch is a fixed price on the first call, and a configurator that implied
 * a firm number would undercut that on the page that makes the promise.
 */

export type TierKey = "signal" | "studio" | "bespoke";
export type TimelineKey = "fast" | "standard" | "relaxed";

export interface Answers {
  purpose?: "launch" | "presence" | "bespoke";
  scope?: "one" | "few" | "many";
  copy?: "yes" | "partly" | "no";
  timing?: TimelineKey;
}

export interface Estimate {
  tier: TierKey;
  /** Roubles. Rendered with a locale-aware separator at the call site. */
  low: number;
  high: number;
  timeline: TimelineKey;
}

/** The published floor for each tier. Must match the dictionaries. */
const FLOOR: Record<TierKey, number> = {
  signal: 60_000,
  studio: 140_000,
  bespoke: 320_000,
};

/** How far above the floor the upper bound sits, before modifiers. */
const SPREAD: Record<TierKey, number> = {
  signal: 0.55,
  studio: 0.6,
  bespoke: 0.75,
};

function resolveTier(answers: Answers): TierKey {
  if (answers.purpose === "bespoke") return "bespoke";
  if (answers.scope === "many") return "bespoke";
  if (answers.purpose === "presence") return "studio";
  if (answers.scope === "few") return "studio";
  return "signal";
}

export function estimate(answers: Answers): Estimate {
  const tier = resolveTier(answers);
  const floor = FLOOR[tier];

  // Writing the copy is real work and it is the single most common cause
  // of a project running long, so it moves the number rather than being a
  // free checkbox.
  const copyLoad = answers.copy === "no" ? 0.18 : answers.copy === "partly" ? 0.08 : 0;
  // A compressed schedule is priced, not promised away.
  const rush = answers.timing === "fast" ? 0.12 : 0;

  const low = Math.round((floor * (1 + copyLoad)) / 5000) * 5000;
  const high =
    Math.round((floor * (1 + SPREAD[tier] + copyLoad + rush)) / 5000) * 5000;

  return { tier, low, high, timeline: answers.timing ?? "standard" };
}

export function formatRoubles(value: number, locale: string): string {
  // Both locales use a space as the thousands separator, matching the
  // "60 000 ₽" already printed on the tier cards.
  return `${new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US", {
    useGrouping: true,
  })
    .format(value)
    .replace(/[ ,]/g, " ")} ₽`;
}
