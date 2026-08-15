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
  { id: "services", bearing: "078°", degrees: 78 },
  // The agent demo sits immediately after the services that names it:
  // the claim and its proof should not be separated by anything.
  { id: "agent", bearing: "104°", degrees: 104 },
  { id: "configurator", bearing: "128°", degrees: 128 },
  { id: "work", bearing: "152°", degrees: 152 },
  { id: "process", bearing: "196°", degrees: 196 },
  { id: "voices", bearing: "246°", degrees: 246 },
  { id: "questions", bearing: "302°", degrees: 302 },
  { id: "start", bearing: "355°", degrees: 355 },
] as const satisfies readonly SectionMeta[];

export type SectionId = (typeof SECTIONS)[number]["id"];

/**
 * The North Agent case page has its own compass sweep. It starts at 310°,
 * the bearing the studio files the product under, and turns to just short
 * of north — the page is the last leg of the journey, not a detour.
 */
export const AGENT_SECTIONS = [
  { id: "agent-hero", bearing: "310°", degrees: 310 },
  { id: "agent-chat", bearing: "320°", degrees: 320 },
  { id: "agent-capabilities", bearing: "330°", degrees: 330 },
  { id: "agent-deploy", bearing: "340°", degrees: 340 },
  { id: "agent-numbers", bearing: "350°", degrees: 350 },
  { id: "agent-start", bearing: "358°", degrees: 358 },
] as const satisfies readonly SectionMeta[];

export type AgentSectionId = (typeof AGENT_SECTIONS)[number]["id"];

const AGENT_BY_ID = new Map(AGENT_SECTIONS.map((s) => [s.id, s]));

export function agentSectionById(id: AgentSectionId): (typeof AGENT_SECTIONS)[number] {
  const section = AGENT_BY_ID.get(id);
  if (!section) throw new Error(`Unknown agent section: ${id}`);
  return section;
}

/**
 * North Flow's sweep, filed at 285° — one product bearing west of North
 * Agent's 310°, so the two cases sit next to each other on the dial without
 * ever reading the same. It closes just short of north for the same reason
 * the agent case does: a product page is the last leg, not a detour.
 */
export const FLOW_SECTIONS = [
  { id: "flow-hero", bearing: "285°", degrees: 285 },
  { id: "flow-conveyor", bearing: "300°", degrees: 300 },
  { id: "flow-inside", bearing: "316°", degrees: 316 },
  { id: "flow-deploy", bearing: "332°", degrees: 332 },
  { id: "flow-start", bearing: "352°", degrees: 352 },
] as const satisfies readonly SectionMeta[];

export type FlowSectionId = (typeof FLOW_SECTIONS)[number]["id"];

const FLOW_BY_ID = new Map(FLOW_SECTIONS.map((s) => [s.id, s]));

export function flowSectionById(id: FlowSectionId): (typeof FLOW_SECTIONS)[number] {
  const section = FLOW_BY_ID.get(id);
  if (!section) throw new Error(`Unknown flow section: ${id}`);
  return section;
}

/** The four carried in the header. The footer indexes all of them. */
export const NAV_IDS = [
  "studio",
  "services",
  "work",
  "process",
] as const satisfies readonly SectionId[];

export function sectionAt(index: number): (typeof SECTIONS)[number] {
  return SECTIONS[index] ?? SECTIONS[0];
}

const BY_ID = new Map(SECTIONS.map((section) => [section.id, section]));

/**
 * Look a section up by name, never by position.
 *
 * Sections used to reach for `SECTIONS[4]` and friends. Inserting the agent
 * demo in the middle shifted every index after it, and the failure was
 * silent and ugly: the closing section rendered `id="questions"`, so the
 * page carried a duplicate id and `#start` did not exist at all — which
 * broke the footer link, the header CTA and the compass readout at once.
 *
 * The id is a `SectionId`, so a typo here is a compile error rather than
 * another missing anchor.
 */
export function sectionById(id: SectionId): (typeof SECTIONS)[number] {
  const section = BY_ID.get(id);
  if (!section) throw new Error(`Unknown section: ${id}`);
  return section;
}
