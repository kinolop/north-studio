const GRAIN_TEXTURE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * Film grain. Static, not animated — moving grain is expensive and reads as
 * a filter, whereas still grain reads as the stock the image was shot on.
 * Its real job is killing the banding that any near-black gradient produces
 * on an 8-bit display.
 */
export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 opacity-[0.16] mix-blend-overlay"
      style={{ backgroundImage: GRAIN_TEXTURE, backgroundRepeat: "repeat" }}
    />
  );
}
