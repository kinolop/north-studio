/**
 * A phone or tablet driven by a finger. Here the page scrolls natively on
 * the compositor, and anything the main thread has to redraw while it moves
 * is a chance to drop a frame, so the motion that runs during a scroll is
 * cut down to what the compositor can carry alone.
 */
export const TOUCH_QUERY = "(hover: none) and (pointer: coarse)";

export function isTouchScreen(): boolean {
  return typeof window !== "undefined" && window.matchMedia(TOUCH_QUERY).matches;
}
