/**
 * The loader and the hero share one moment: the sheet lifts, and the hero
 * starts writing. The hero asks here instead of guessing a delay, so a
 * skipped or suppressed loader starts the page immediately.
 */

let done = false;
const listeners = new Set<() => void>();

export function markIntroDone() {
  if (done) return;
  done = true;
  for (const listener of listeners) listener();
  listeners.clear();
}

export function onIntroDone(listener: () => void): () => void {
  if (done) {
    listener();
    return () => {};
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}
