/**
 * A single pointer signal for the whole site.
 *
 * The cursor is a light source in three places at once — the 3D scene, the
 * 2D bloom and the fog shader — so it is sampled once here, damped once
 * here, and published once here. Three listeners would produce three subtly
 * different lights and three times the work per frame.
 *
 * Two things this deliberately does NOT do, both learned from profiling:
 *
 *   • It does not write CSS custom properties to <html>. Setting a custom
 *     property on the root invalidates style for every element that could
 *     inherit it, once per frame, forever. Subscribers get the value and
 *     write to their own element instead.
 *   • It does not run continuously. The loop stops as soon as the damped
 *     position has caught up with the target and restarts on the next
 *     pointer move, so a still cursor costs nothing at all.
 *
 * Degradation is built in rather than bolted on:
 *   • fine pointer      → the light follows the cursor, damped, with weight
 *   • coarse/no pointer → the light performs a slow automatic sweep
 *   • reduced motion    → the light parks off-centre and stops
 */

export interface PointerSignal {
  /** Viewport pixels. */
  readonly x: number;
  readonly y: number;
  /** Normalised to -1..1, origin at viewport centre, y up. */
  readonly nx: number;
  readonly ny: number;
  /** True once a real pointer has been seen. */
  readonly engaged: boolean;
}

type Listener = (signal: PointerSignal) => void;

/** Higher damps faster. Tuned so the light trails the cursor by a beat. */
const DAMP_LAMBDA = 7.5;
/** Below this the light has arrived and the loop can stop. */
const SETTLED_PX = 0.35;
/** Where the light rests before any pointer arrives, and under reduced motion. */
const REST = { x: 0.62, y: 0.36 } as const;
/** The ambient sweep has nothing to keep up with, so it runs at half rate. */
const AMBIENT_INTERVAL = 1 / 30;

let started = false;
let rafId = 0;
let lastTime = 0;
let ambientAccumulator = 0;

const target = { x: 0, y: 0 };
const current = { x: 0, y: 0 };
let engaged = false;
let ambient = false;
let reduced = false;
let ambientClock = 0;

const listeners = new Set<Listener>();
const signal: { -readonly [K in keyof PointerSignal]: PointerSignal[K] } = {
  x: 0,
  y: 0,
  nx: 0,
  ny: 0,
  engaged: false,
};

function viewport() {
  return { w: window.innerWidth || 1, h: window.innerHeight || 1 };
}

function setTargetFromEvent(event: PointerEvent) {
  if (reduced) return;
  ambient = false;
  engaged = true;
  target.x = event.clientX;
  target.y = event.clientY;
  startLoop();
}

/**
 * Lissajous sweep for touch devices: two incommensurable frequencies, so the
 * path never visibly repeats. Kept inside the middle of the viewport where a
 * light actually reads.
 */
function advanceAmbient(dt: number) {
  ambientClock += dt;
  const { w, h } = viewport();
  target.x = w * (0.5 + 0.3 * Math.sin(ambientClock * 0.11));
  target.y = h * (0.42 + 0.22 * Math.sin(ambientClock * 0.157 + 1.2));
}

function publish() {
  const { w, h } = viewport();
  signal.x = current.x;
  signal.y = current.y;
  signal.nx = (current.x / w) * 2 - 1;
  signal.ny = -((current.y / h) * 2 - 1);
  signal.engaged = engaged;

  for (const listener of listeners) listener(signal);
}

function frame(time: number) {
  const dt = lastTime === 0 ? 1 / 60 : Math.min((time - lastTime) / 1000, 0.1);
  lastTime = time;

  if (ambient && !reduced) {
    ambientAccumulator += dt;
    if (ambientAccumulator < AMBIENT_INTERVAL) {
      rafId = window.requestAnimationFrame(frame);
      return;
    }
    ambientAccumulator = 0;
    advanceAmbient(dt);
  }

  // Frame-rate independent exponential damping — the light has mass.
  const k = 1 - Math.exp(-DAMP_LAMBDA * dt);
  current.x += (target.x - current.x) * k;
  current.y += (target.y - current.y) * k;

  publish();

  // Arrived, and nothing is driving it: stop until the next pointer move.
  const settled =
    Math.abs(target.x - current.x) < SETTLED_PX &&
    Math.abs(target.y - current.y) < SETTLED_PX;
  if (settled && !ambient) {
    rafId = 0;
    return;
  }

  rafId = window.requestAnimationFrame(frame);
}

function onVisibility() {
  if (document.hidden) stopLoop();
  else if (listeners.size > 0) startLoop();
}

function startLoop() {
  if (rafId !== 0 || reduced || document.hidden) return;
  lastTime = 0;
  rafId = window.requestAnimationFrame(frame);
}

function stopLoop() {
  if (rafId === 0) return;
  window.cancelAnimationFrame(rafId);
  rafId = 0;
}

function init() {
  if (started) return;
  started = true;

  const { w, h } = viewport();
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  target.x = current.x = w * REST.x;
  target.y = current.y = h * REST.y;
  ambient = !fine && !reduced;

  if (fine && !reduced) {
    window.addEventListener("pointermove", setTargetFromEvent, { passive: true });
  }
  document.addEventListener("visibilitychange", onVisibility);

  publish();
}

/** Subscribe to the damped pointer. Returns an unsubscribe function. */
export function subscribePointer(listener: Listener): () => void {
  if (typeof window === "undefined") return () => {};

  init();
  listeners.add(listener);
  listener(signal);
  if (ambient) startLoop();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stopLoop();
  };
}

/** Current damped pointer without subscribing. */
export function readPointer(): PointerSignal {
  return signal;
}
