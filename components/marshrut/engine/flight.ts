import { clamp, smoother } from "@/lib/marshrut/util";

/**
 * Moving the camera across seven orders of magnitude.
 *
 * A camera that goes from four metres above a pallet to six thousand
 * kilometres above Asia cannot simply interpolate its position: half the
 * time would pass before it had left the pallet's neighbourhood, and the
 * rest would be a blur. The path used here is the one from van Wijk and
 * Nuij, "Smooth and efficient zooming and panning" (2003): the camera rises
 * until the two places are both in view, crosses, and comes down, at a speed
 * that feels constant in screen space. It is the flight a map app makes when
 * you ask it to show you somewhere else, and it is right for the same
 * reason.
 */

export interface View {
  /** The point on the plate the camera looks at. */
  x: number;
  y: number;
  z: number;
  /** Distance from the camera to that point, metres. */
  d: number;
  /** Elevation of the camera above the horizontal, radians. */
  pitch: number;
  /** Direction the camera sits in, radians; 0 is south of the target looking north. */
  yaw: number;
}

export const copyView = (v: View): View => ({ ...v });

const RHO = 1.38;

export interface Flight {
  /** Seconds it should take. */
  seconds: number;
  at(t: number): View;
}

const shortest = (a: number, b: number) => {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
};

export function planFlight(a: View, b: View): Flight {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const u1 = Math.hypot(dx, dz);
  const w0 = a.d;
  const w1 = b.d;
  const yaw = shortest(a.yaw, b.yaw);

  const mix = (t: number, w: number, k: number): View => {
    const e = smoother(t);
    return {
      x: a.x + dx * k,
      z: a.z + dz * k,
      y: a.y + (b.y - a.y) * e,
      d: w,
      pitch: a.pitch + (b.pitch - a.pitch) * e,
      yaw: a.yaw + yaw * e,
    };
  };

  // Nothing to cross: a pure zoom is a straight line in log space.
  if (u1 < 1e-3 * Math.max(w0, w1)) {
    const s = Math.abs(Math.log(w1 / w0)) / RHO;
    return {
      seconds: clamp(0.9 + 0.5 * s, 1.1, 4.6),
      at: (t) => mix(t, w0 * Math.pow(w1 / w0, smoother(t)), 0),
    };
  }

  const r2 = RHO * RHO;
  const r4 = r2 * r2;
  const b0 = (w1 * w1 - w0 * w0 + r4 * u1 * u1) / (2 * w0 * r2 * u1);
  const b1 = (w1 * w1 - w0 * w0 - r4 * u1 * u1) / (2 * w1 * r2 * u1);
  const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
  const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
  const S = (r1 - r0) / RHO;

  return {
    seconds: clamp(0.9 + 0.5 * Math.abs(S), 1.1, 4.8),
    at: (t) => {
      const s = S * smoother(t);
      const u = (w0 / r2) * Math.cosh(r0) * Math.tanh(RHO * s + r0) - (w0 / r2) * Math.sinh(r0);
      const w = (w0 * Math.cosh(r0)) / Math.cosh(RHO * s + r0);
      return mix(t, w, u / u1);
    },
  };
}
