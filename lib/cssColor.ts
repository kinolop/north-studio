/**
 * A theme colour, as GSAP can animate it.
 *
 * GSAP blends colours it can read, and `var(--color-ink)` is not one: a
 * tween between two variables passes through near-transparent black, so
 * text animated that way vanishes for the length of the tween. Resolve the
 * token to its value first.
 */
export function cssColor(token: `--${string}`, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim() || fallback;
}
