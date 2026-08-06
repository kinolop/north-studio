/**
 * One device-capability read, shared by everything expensive.
 *
 * Measured once at module load rather than sniffed per frame. The signals
 * are deliberately crude — there is no reliable GPU query on the web, and a
 * wrong guess in the cautious direction only costs a slightly softer fog.
 */

export type Tier = "low" | "standard";

function detect(): Tier {
  if (typeof window === "undefined") return "standard";

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as { deviceMemory?: number }).deviceMemory ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  // Few cores, little memory, or a phone. Any one of these is enough to
  // drop a full-screen noise shader below 60fps.
  if (cores <= 4 || memory <= 4 || coarse) return "low";
  return "standard";
}

let cached: Tier | null = null;

export function qualityTier(): Tier {
  cached ??= detect();
  return cached;
}
