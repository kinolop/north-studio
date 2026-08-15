import { SECTIONS, type SectionMeta } from "./sections";

/**
 * Which set of sections the compass, the rail and the scroll store are
 * currently reading.
 *
 * The instruments were built when there was one page, so they imported the
 * home section list directly. A second page with its own bearings would
 * have left them measuring anchors that do not exist — the compass frozen
 * on the wrong heading and the rail's progress meaningless.
 *
 * Each page declares its own list on mount and restores the home list on
 * unmount, so the instruments always describe the page you are actually on.
 */

let active: readonly SectionMeta[] = SECTIONS;
const listeners = new Set<() => void>();

export function setActiveSections(next: readonly SectionMeta[]) {
  if (next === active) return;
  active = next;
  for (const listener of listeners) listener();
}

export function resetActiveSections() {
  setActiveSections(SECTIONS);
}

export function getActiveSections(): readonly SectionMeta[] {
  return active;
}

export function subscribeActiveSections(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
