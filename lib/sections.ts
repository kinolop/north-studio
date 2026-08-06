/**
 * The descent, and its bearings.
 *
 * Language-neutral on purpose: ids are URL anchors and headings are
 * instrument readings, so neither is translated. The human-readable label
 * for each section lives in the dictionaries under `sections[id]`.
 *
 * The bearings rise monotonically from 000° to 355°, so the compass sweeps
 * once through a full turn as the visitor travels the page. Inserting a
 * section means choosing a heading that keeps that sweep ordered.
 */

export type Bearing = `${number}°`;

export interface SectionMeta {
  readonly id: string;
  readonly bearing: Bearing;
  /** Degrees as a number, for rotating the compass needle. */
  readonly degrees: number;
}

export const SECTIONS = [
  { id: "origin", bearing: "000°", degrees: 0 },
  { id: "studio", bearing: "032°", degrees: 32 },
  { id: "founder", bearing: "058°", degrees: 58 },
  { id: "engagements", bearing: "078°", degrees: 78 },
  { id: "configurator", bearing: "100°", degrees: 100 },
  { id: "work", bearing: "124°", degrees: 124 },
  { id: "process", bearing: "190°", degrees: 190 },
  { id: "voices", bearing: "246°", degrees: 246 },
  { id: "questions", bearing: "302°", degrees: 302 },
  { id: "start", bearing: "355°", degrees: 355 },
] as const satisfies readonly SectionMeta[];

export type SectionId = (typeof SECTIONS)[number]["id"];

/** The four carried in the header. The footer indexes all of them. */
export const NAV_IDS = [
  "studio",
  "engagements",
  "work",
  "process",
] as const satisfies readonly SectionId[];

export function sectionAt(index: number): (typeof SECTIONS)[number] {
  return SECTIONS[index] ?? SECTIONS[0];
}
