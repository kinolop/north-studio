/** Identity that is the same in every language. */
export const STUDIO = {
  name: "North Studio",
  wordmark: "NORTH",
  wordmarkFull: "NORTH STUDIO",
} as const;

/**
 * Case-study captures, keyed by project. Kept out of the dictionaries
 * because an image path is not translatable — duplicating it per locale
 * would be two places to update and one place to forget.
 *
 * Drop a file in `public/work/` and add its key here; ProjectPlate switches
 * from the generated placeholder plate to the real capture automatically.
 * Recommended: WebP or AVIF, ~1600×1000 for the lead card, ~1200×750 below.
 */
export const PROJECT_IMAGES: Readonly<Record<string, string>> = {
  // meridian: "/work/meridian.webp",
  // halden: "/work/halden.webp",
  // aster: "/work/aster.webp",
};
