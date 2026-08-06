/**
 * Sound, off until asked for.
 *
 * Web Audio rather than Howler: the whole palette is a low drone and two
 * short transients, all of which are cheaper to synthesise than to ship as
 * files — and a synthesised tick is never a 40kB download for something
 * that plays for 30 milliseconds.
 *
 * The AudioContext is created lazily, inside the click that enables sound,
 * because every browser refuses to start one without a user gesture.
 * Nothing here can make a noise the visitor did not ask for.
 */

export const SOUND_STORAGE_KEY = "north-sound";

type Voice = { osc: OscillatorNode; gain: GainNode };

let context: AudioContext | null = null;
let master: GainNode | null = null;
let drone: Voice | null = null;
let enabled = false;

/** Barely-there by design. Err quiet: this plays under a whole page. */
const MASTER_LEVEL = 0.055;
const DRONE_LEVEL = 0.5;

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (context) return context;

  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;

  context = new Ctor();
  master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);
  return context;
}

function startDrone(ctx: AudioContext, out: GainNode) {
  if (drone) return;

  // Two detuned sines an octave apart through a low-pass: a room tone, not
  // a note. Anything with a clear pitch would become a melody the visitor
  // cannot get out of their head.
  const gain = ctx.createGain();
  gain.gain.value = DRONE_LEVEL;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 180;

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 47;

  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.value = 94.6; // Slightly off the octave, so they beat slowly.

  const subGain = ctx.createGain();
  subGain.gain.value = 0.35;

  osc.connect(filter);
  sub.connect(subGain);
  subGain.connect(filter);
  filter.connect(gain);
  gain.connect(out);

  osc.start();
  sub.start();
  drone = { osc, gain };
}

/** A short filtered blip. `bright` raises the pitch for UI clicks. */
function transient(frequency: number, duration: number, level: number) {
  const ctx = context;
  const out = master;
  if (!ctx || !out || !enabled) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = "triangle";
  osc.frequency.setValueAtTime(frequency, now);
  osc.frequency.exponentialRampToValueAtTime(frequency * 0.6, now + duration);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(level, now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(out);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function isSoundEnabled(): boolean {
  return enabled;
}

/** Must be called from inside a user gesture the first time. */
export function setSoundEnabled(next: boolean) {
  enabled = next;

  if (!next) {
    if (master && context) {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.linearRampToValueAtTime(0, context.currentTime + 0.4);
    }
    try {
      window.localStorage.setItem(SOUND_STORAGE_KEY, "off");
    } catch {
      /* storage refused; the toggle still works for this visit */
    }
    return;
  }

  const ctx = ensureContext();
  if (!ctx || !master) return;
  void ctx.resume();

  startDrone(ctx, master);
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.linearRampToValueAtTime(MASTER_LEVEL, ctx.currentTime + 1.2);

  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, "on");
  } catch {
    /* as above */
  }
}

/** Section change. */
export function playTick() {
  transient(880, 0.09, 0.5);
}

/** Buttons, choices, the CTA. */
export function playClick() {
  transient(1320, 0.05, 0.35);
}

export function disposeSound() {
  drone?.osc.stop();
  drone = null;
  void context?.close();
  context = null;
  master = null;
  enabled = false;
}
