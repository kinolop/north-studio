import { getActiveSections } from "./activeSections";

/**
 * One scroll signal for the whole site, for the same reason as the pointer
 * store: the rail, the header and the compass all need progress, velocity
 * and the active section, and three rAF loops measuring the same document
 * would be three chances to disagree.
 *
 * The loop only runs while the page is actually moving. It wakes on a
 * scroll event and shuts down once the damped values have caught up, so a
 * page sitting still costs nothing — which, on a long editorial page, is
 * most of the time the visitor is on it.
 */

export interface ScrollSignal {
  /** Raw document scroll, px. */
  readonly y: number;
  /** 0..1 through the document, damped. */
  readonly progress: number;
  /** Damped px-per-frame. Negative is upward. */
  readonly velocity: number;
  /** Index into SECTIONS of whatever owns the viewport's upper third. */
  readonly index: number;
}

type Listener = (signal: ScrollSignal) => void;

/** Below these the damped values have arrived and the loop can stop. */
const SETTLED_PROGRESS = 0.0004;
const SETTLED_VELOCITY = 0.05;

const listeners = new Set<Listener>();
const signal: { -readonly [K in keyof ScrollSignal]: ScrollSignal[K] } = {
  y: 0,
  progress: 0,
  velocity: 0,
  index: 0,
};

let rafId = 0;
let started = false;
let reduced = false;
let lastY = 0;
let lastTime = 0;
let offsets: number[] = [];

function measure() {
  offsets = getActiveSections().map(
    ({ id }) => document.getElementById(id)?.offsetTop ?? 0,
  );
}

function frame(time: number) {
  const dt = lastTime === 0 ? 16 : Math.min(time - lastTime, 100);
  lastTime = time;
  // Normalised to a 60fps step so damping behaves the same on a 120Hz panel.
  const step = dt / 16.67;

  const y = window.scrollY;
  const max = Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    1,
  );
  const raw = Math.min(Math.max(y / max, 0), 1);

  signal.y = y;
  signal.velocity += (y - lastY - signal.velocity) * Math.min(0.18 * step, 1);
  lastY = y;
  signal.progress += (raw - signal.progress) * Math.min((reduced ? 1 : 0.14) * step, 1);

  const probe = y + window.innerHeight * 0.34;
  let index = 0;
  for (let i = 0; i < offsets.length; i += 1) {
    if (probe >= (offsets[i] ?? 0)) index = i;
  }
  signal.index = index;

  for (const listener of listeners) listener(signal);

  const settled =
    Math.abs(raw - signal.progress) < SETTLED_PROGRESS &&
    Math.abs(signal.velocity) < SETTLED_VELOCITY;

  if (settled) {
    // Snap the last fraction so nothing is left visibly short of its mark.
    signal.progress = raw;
    signal.velocity = 0;
    for (const listener of listeners) listener(signal);
    rafId = 0;
    return;
  }

  rafId = window.requestAnimationFrame(frame);
}

function start() {
  if (rafId !== 0 || document.hidden || listeners.size === 0) return;
  lastTime = 0;
  rafId = window.requestAnimationFrame(frame);
}

function stop() {
  if (rafId === 0) return;
  window.cancelAnimationFrame(rafId);
  rafId = 0;
}

function onScroll() {
  start();
}

function onVisibility() {
  if (document.hidden) stop();
  else start();
}

function init() {
  if (started) return;
  started = true;

  reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  lastY = window.scrollY;
  measure();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    measure();
    start();
  });
  document.addEventListener("visibilitychange", onVisibility);
  // Sections move as fonts land and reveals resolve.
  document.fonts?.ready
    .then(() => {
      measure();
      start();
    })
    .catch(() => {});
}

export function subscribeScroll(listener: Listener): () => void {
  if (typeof window === "undefined") return () => {};

  init();
  listeners.add(listener);
  listener(signal);
  start();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stop();
  };
}

/** Force a re-measure after layout changes (pinned sections, accordions). */
export function remeasureSections() {
  if (typeof window === "undefined" || !started) return;
  measure();
  start();
}
