import * as THREE from "three";

/**
 * The N, constructed rather than loaded.
 *
 * No font file and no GLTF: the glyph is ten points of arithmetic, which
 * means zero network requests, zero loader states, and a shape we can tune
 * to the millimetre instead of accepting whatever a typeface gives us.
 *
 *        0 ──────── 9              W  overall width
 *        │ ╲         │             H  overall height
 *        │  ╲        │             S  stem width
 *        │   ╲       8             Q  vertical drop of the diagonal where it
 *        1    ╲      │                meets the left stem
 *        │     ╲     │
 *        2 ─ 3  ╲ ── 7
 *            ╲   ╲   │
 *        (bottom)    │
 *
 * The two long edges of the diagonal are parallel by construction — both
 * have slope (Q − H) / (W − 2S) — so the stroke keeps a constant weight
 * along its whole run, which is what stops it reading as a wireframe letter.
 */

const W = 2.4;
const H = 3.2;
const S = 0.58;
/** Tuned so the diagonal's perpendicular weight lands at ~0.95 of the stem. */
const Q = 1.09;

export const GLYPH_ASPECT = W / H;

/**
 * The outline in 0..1 space, origin bottom-left, counter-clockwise.
 *
 * Exported because the preloader rasterises the same letter on a 2D canvas.
 * Two definitions of the N would eventually become two different Ns.
 */
export const N_POLYGON: readonly (readonly [number, number])[] = [
  [0, 0],
  [S / W, 0],
  [S / W, (H - Q) / H],
  [(W - S) / W, 0],
  [1, 0],
  [1, 1],
  [(W - S) / W, 1],
  [(W - S) / W, Q / H],
  [S / W, 1],
  [0, 1],
] as const;

/** Even-odd ray cast. Used to sample the glyph into a point grid. */
export function isInsideGlyph(x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = N_POLYGON.length - 1; i < N_POLYGON.length; j = i, i += 1) {
    const a = N_POLYGON[i]!;
    const b = N_POLYGON[j]!;
    const intersects =
      a[1] > y !== b[1] > y &&
      x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0];
    if (intersects) inside = !inside;
  }
  return inside;
}

export function createNShape(): THREE.Shape {
  const shape = new THREE.Shape();

  // Centre on the origin so rotation happens about the glyph, not a corner.
  N_POLYGON.forEach(([nx, ny], index) => {
    const x = nx * W - W / 2;
    const y = ny * H - H / 2;
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();

  return shape;
}

/**
 * Extruded with a real bevel. The bevel is not a detail — it is the whole
 * effect. A flat extrusion catches one broad reflection and reads as
 * plastic; a bevelled edge catches a thin, moving specular line at every
 * corner, which is what makes the object read as machined metal.
 */
export function createNGeometry(): THREE.ExtrudeGeometry {
  const geometry = new THREE.ExtrudeGeometry(createNShape(), {
    depth: 0.62,
    bevelEnabled: true,
    bevelThickness: 0.055,
    bevelSize: 0.05,
    bevelOffset: 0,
    bevelSegments: 6,
    curveSegments: 1,
  });

  geometry.center();
  geometry.computeVertexNormals();

  return geometry;
}
