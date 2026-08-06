import { ditherPatternUri } from "@/lib/dither";

/**
 * The dither motif as a reusable surface.
 *
 * Monochrome and restrained by default. It has one job everywhere it
 * appears: to make a dark panel feel like a printed surface rather than an
 * empty div, and to give the founder portrait something to resolve out of.
 */
export function DitherLayer({
  level = 0.35,
  scale = 3,
  opacity = 0.14,
  className = "",
}: {
  /** 0..1 — how much of the Bayer matrix is filled. */
  level?: number;
  /** Pixel size of one matrix cell. */
  scale?: number;
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: ditherPatternUri(level),
        backgroundSize: `${scale * 4}px ${scale * 4}px`,
        backgroundRepeat: "repeat",
        opacity,
        imageRendering: "pixelated",
      }}
    />
  );
}
