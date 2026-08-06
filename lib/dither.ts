/**
 * The dithering motif, in one place.
 *
 * A 4×4 Bayer matrix is the smallest ordered-dither kernel that still reads
 * as deliberate structure rather than as noise — which is exactly the
 * distinction the brand needs. Error-diffusion (Floyd–Steinberg) would look
 * more photographic but has no repeating grid, and the grid is the point:
 * it rhymes with the technical plates and the compass ticks.
 */

/** Normalised 0..1 thresholds, row-major. */
export const BAYER_4 = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
].map((v) => (v + 0.5) / 16);

export function bayerThreshold(x: number, y: number): number {
  return BAYER_4[(y & 3) * 4 + (x & 3)]!;
}

/**
 * A tileable ordered-dither dot pattern as a data URI, for CSS backgrounds.
 *
 * Generated rather than shipped as a file: it is 16 rects, it has to match
 * `BAYER_4` exactly, and an asset that can drift out of sync with the code
 * that describes it is a bug waiting to happen.
 *
 * @param level 0..1 — how much of the matrix is filled. Low values give a
 *              sparse field, high values approach solid.
 */
export function ditherPatternUri(level: number, tint = "255,255,255"): string {
  const cells: string[] = [];
  for (let y = 0; y < 4; y += 1) {
    for (let x = 0; x < 4; x += 1) {
      if (bayerThreshold(x, y) < level) {
        cells.push(`<rect x='${x}' y='${y}' width='1' height='1'/>`);
      }
    }
  }
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='4' height='4' ` +
    `shape-rendering='crispEdges' fill='rgb(${tint})'>${cells.join("")}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
