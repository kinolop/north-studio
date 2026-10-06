/**
 * The photographs that exist so far, with their sizes. Written by the
 * grading script that prepares them; a frame that is not here is not
 * shown, and the page falls back to type in its place.
 */
export const PHOTOS: Readonly<Record<string, { readonly w: number; readonly h: number }>> = {
  "coffee": { w: 2400, h: 1340 },
  "croissants": { w: 2400, h: 1340 },
  "exterior": { w: 1536, h: 1024 },
  "hall": { w: 1536, h: 1024 },
  "hands": { w: 2400, h: 1340 },
  "oven": { w: 2400, h: 1340 },
  "rye": { w: 2400, h: 1340 },
};
