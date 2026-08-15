import type { FlowLead } from "@/lib/i18n/types";

/**
 * The North Flow conveyor: its timing contract, and the small amount of
 * arithmetic the journal needs.
 *
 * The line has no simulation loop and no timers. Five chips run one CSS
 * animation on an endless loop, evenly offset in time, and the browser's own
 * animation clock decides where each one is. React is told a chip has
 * completed a circuit by `animationiteration` — one event every 2.08s — and
 * does nothing else. That is why it holds 60fps with a page of fog and
 * chrome above it: nothing here runs per frame.
 *
 * The percentages below mirror the @keyframes in app/globals.css. They are
 * two halves of one contract — change one and change the other.
 */

/** One chip's whole journey, intake to filed. */
export const CYCLE_MS = 10_400;

/** Chips on the line at once. */
export const SLOTS = 5;

/**
 * The gap between one chip and the next.
 *
 * Not a free choice: chips only ever collide while standing still, so the
 * cadence has to exceed the longest dwell in the cycle (18%, at the intake).
 * At a fifth of the cycle it clears that with room to spare, which is why
 * the line always reads as one chip per station plus one in transit.
 */
export const CADENCE_MS = CYCLE_MS / SLOTS;

/** Where in the cycle a chip is centred on each station, as a fraction. */
export const ARRIVAL = [0.04, 0.32, 0.58, 0.8] as const;

/**
 * Phase offsets for the station markers.
 *
 * At a fixed cadence, arrival is arithmetic rather than an event: station i
 * receives a chip every CADENCE_MS, starting at its own arrival offset. So
 * each marker runs one looping animation and never has to be told anything.
 */
export const STATION_DELAY_MS = ARRIVAL.map(
  (arrival) => Math.round(arrival * CYCLE_MS) % CADENCE_MS,
);

/** Where the invented CRM's card numbering happens to be today. */
export const CARD_BASE = 1240;

/** Minutes of somebody's day a lead costs when it is handled by hand. */
export const MINUTES_PER_LEAD = 7;

/**
 * Lines of journal kept. Tuned to the panel: five fills it with the oldest
 * one dissolving under the mask as the newest lands, which is what a log
 * that is being written into looks like. More would be rendering history
 * nobody can see.
 */
export const JOURNAL_MAX = 5;

export interface JournalEntry {
  readonly id: number;
  /** An index into the dictionary, never a resolved string: switching
   *  language has to re-read the log, not leave it in the old one. */
  readonly lead: number;
  readonly card: number;
  readonly time: string;
}

export interface LineState {
  readonly slots: readonly { readonly lead: number; readonly card: number }[];
  readonly journal: readonly JournalEntry[];
  readonly processed: number;
  readonly warm: number;
  readonly cold: number;
  readonly nextCard: number;
  readonly nextId: number;
  readonly seeded: boolean;
}

export type LineAction =
  /** A chip completed its circuit: file it, and load the slot again. */
  | {
      readonly type: "cycle";
      readonly slot: number;
      readonly time: string;
      readonly leads: readonly FlowLead[];
    }
  /** The log the line wrote before the visitor arrived. */
  | {
      readonly type: "seed";
      readonly entries: readonly JournalEntry[];
      readonly leads: readonly FlowLead[];
    };

export function initialLine(): LineState {
  return {
    slots: Array.from({ length: SLOTS }, (_, i) => ({
      lead: i,
      card: CARD_BASE + i,
    })),
    journal: [],
    processed: 0,
    warm: 0,
    cold: 0,
    nextCard: CARD_BASE + SLOTS,
    nextId: 0,
    seeded: false,
  };
}

export function lineReducer(state: LineState, action: LineAction): LineState {
  if (action.type === "seed") {
    // Effects run twice in development; a log that doubled on mount would
    // be a bug the founder only ever sees locally.
    if (state.seeded) return state;

    const tones = action.entries.map((entry) => action.leads[entry.lead]?.tone);

    return {
      ...state,
      seeded: true,
      journal: action.entries,
      nextId: action.entries.length,
      processed: action.entries.length,
      warm: tones.filter((tone) => tone === "warm").length,
      cold: tones.filter((tone) => tone === "cold").length,
    };
  }

  const slot = state.slots[action.slot];
  const lead = slot ? action.leads[slot.lead] : undefined;
  if (!slot || !lead) return state;

  /**
   * Each slot advances by the number of slots, so the line walks the whole
   * list rather than handing every slot the same two leads forever. With
   * twelve leads and five slots the two counts share no factor, which is
   * the entire reason there are twelve of them.
   */
  const slots = state.slots.map((current, index) =>
    index === action.slot
      ? {
          lead: (current.lead + SLOTS) % action.leads.length,
          card: state.nextCard,
        }
      : current,
  );

  const entry: JournalEntry = {
    id: state.nextId,
    lead: slot.lead,
    card: slot.card,
    time: action.time,
  };

  return {
    ...state,
    slots,
    journal: [...state.journal, entry].slice(-JOURNAL_MAX),
    processed: state.processed + 1,
    warm: state.warm + (lead.tone === "warm" ? 1 : 0),
    cold: state.cold + (lead.tone === "cold" ? 1 : 0),
    nextCard: state.nextCard + 1,
    nextId: state.nextId + 1,
  };
}

/**
 * The wall clock, 24-hour, in both languages.
 *
 * Deliberately the visitor's real time rather than an invented one: read
 * this page at three in the morning and the log says 03:xx, which is the
 * product's whole argument stated without a word of copy.
 */
export function clockAt(msAgo = 0): string {
  const at = new Date(Date.now() - msAgo);
  const hh = String(at.getHours()).padStart(2, "0");
  const mm = String(at.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** Minutes back the seeded log reaches, newest last. */
export const SEED_MINUTES_AGO = [11, 7, 4, 2] as const;

export function formatNumber(
  value: number,
  locale: string,
  decimals = 0,
): string {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
