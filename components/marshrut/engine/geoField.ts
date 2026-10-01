import { EXTENT, project } from "@/lib/marshrut/geo";

/**
 * The map, built in the browser from vectors.
 *
 * Two things come out of the same data:
 *
 *  - a field of distances, which the plate turns into the tint of land and
 *    sea and the contour lines stepping out from every coast. Distances
 *    interpolate smoothly, so those are soft and cheap;
 *  - a list of segments (coasts, borders, rivers, lake shores), which are
 *    drawn as true hairlines, so ink stays sharp however close the camera
 *    comes. Which segments are coast and which are border is decided by
 *    asking the distance field how far from the sea each one lies.
 *
 * The vectors are rasterised on a canvas and a Felzenszwalb-Huttenlocher
 * transform turns each mask into distances. The work is cut into short
 * tasks that yield between them, so the first screen keeps moving.
 */

interface CountriesFile {
  countries: { iso: string; name: string; polys: number[][][][] }[];
}
interface HydroFile {
  rivers: { r: number; p: number[][] }[];
  lakes: { n: string; p: number[][] }[];
}

export const LINE_COAST = 0;
export const LINE_BORDER = 1;
export const LINE_RIVER = 2;
export const LINE_LAKE = 3;

export interface GeoField {
  width: number;
  height: number;
  /** RGBA, half-float bits: coast (km, + on land), border (km), river (km), lake (0..1). */
  data: Uint16Array;
  /** Metres covered by one texel. */
  texel: number;
  /** Segments, five floats each: ax, az, bx, bz, kind. */
  lines: Float32Array;
}

const WIDTH = 2048;
const INF = 1e20;

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** Runs `step` until it reports done, giving the event loop air every few ms. */
async function slice(step: () => boolean, budget = 10) {
  for (;;) {
    const t0 = performance.now();
    while (performance.now() - t0 < budget) {
      if (step()) return;
    }
    await tick();
  }
}

/** One dimension of the exact Euclidean distance transform. */
function edt1d(f: Float32Array, d: Float32Array, v: Int32Array, z: Float32Array, n: number) {
  let k = 0;
  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;
  for (let q = 1; q < n; q++) {
    let s = 0;
    for (;;) {
      const p = v[k] as number;
      s = (f[q]! + q * q - (f[p]! + p * p)) / (2 * q - 2 * p);
      if (s <= (z[k] as number) && k > 0) k--;
      else break;
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while ((z[k + 1] as number) < q) k++;
    const p = v[k] as number;
    d[q] = (q - p) * (q - p) + (f[p] as number);
  }
}

/** Distance in texels from each cell to the nearest cell whose mask is set. */
async function distance(mask: Uint8Array, w: number, h: number): Promise<Float32Array> {
  const grid = new Float32Array(w * h);
  for (let i = 0; i < grid.length; i++) grid[i] = mask[i] ? 0 : INF;

  const n = Math.max(w, h);
  const f = new Float32Array(n);
  const d = new Float32Array(n);
  const v = new Int32Array(n);
  const z = new Float32Array(n + 1);

  let x = 0;
  await slice(() => {
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x] as number;
    edt1d(f, d, v, z, h);
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y] as number;
    return ++x >= w;
  });

  let y = 0;
  await slice(() => {
    const row = y * w;
    for (let i = 0; i < w; i++) f[i] = grid[row + i] as number;
    edt1d(f, d, v, z, w);
    for (let i = 0; i < w; i++) grid[row + i] = Math.sqrt(d[i] as number);
    return ++y >= h;
  });

  return grid;
}

const f32 = new Float32Array(1);
const u32 = new Uint32Array(f32.buffer);

/** Float to IEEE half, without a function call per component. */
function toHalf(value: number): number {
  f32[0] = value;
  const x = u32[0] as number;
  const sign = (x >>> 16) & 0x8000;
  const exp = ((x >>> 23) & 0xff) - 127 + 15;
  let mant = x & 0x7fffff;
  if (exp <= 0) {
    if (exp < -10) return sign;
    mant = (mant | 0x800000) >> (1 - exp);
    return sign | ((mant + 0x1000) >> 13);
  }
  if (exp >= 31) return sign | 0x7bff;
  return sign | (exp << 10) | ((mant + 0x1000) >> 13);
}

export async function buildGeoField(): Promise<GeoField> {
  const [countries, hydro] = await Promise.all([
    fetch("/marshrut/geo/countries.json").then((r) => r.json() as Promise<CountriesFile>),
    fetch("/marshrut/geo/hydro.json").then((r) => r.json() as Promise<HydroFile>),
  ]);

  const k = WIDTH / (EXTENT.x1 - EXTENT.x0);
  const w = WIDTH;
  const h = Math.round((EXTENT.z1 - EXTENT.z0) * k);
  const texel = 1 / k;

  const layer = () => {
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("no 2d context");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    return ctx;
  };
  const px = (p: { x: number; z: number }) => [(p.x - EXTENT.x0) * k, (p.z - EXTENT.z0) * k] as const;
  const trace = (ctx: OffscreenCanvasRenderingContext2D, ring: number[][], close: boolean) => {
    for (let i = 0; i < ring.length; i++) {
      const c = ring[i] as number[];
      const [x, y] = px(project(c[0] as number, c[1] as number));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    if (close) ctx.closePath();
  };

  // Land. Lakes stay in it: they are tinted separately so a lake never
  // grows the contour lines that belong to open sea.
  const land = layer();
  land.fillStyle = "#fff";
  land.beginPath();
  for (const c of countries.countries) {
    for (const poly of c.polys) for (const ring of poly) trace(land, ring, true);
  }
  land.fill("evenodd");
  await tick();

  const lakes = layer();
  lakes.fillStyle = "#fff";
  for (const lake of hydro.lakes) {
    lakes.beginPath();
    trace(lakes, lake.p, true);
    lakes.fill();
  }
  await tick();

  const read = (ctx: OffscreenCanvasRenderingContext2D) => ctx.getImageData(0, 0, w, h).data;
  const landPixels = read(land);
  const landMask = new Uint8Array(w * h);
  const seaMask = new Uint8Array(w * h);
  for (let i = 0; i < landMask.length; i++) {
    const on = (landPixels[i * 4] as number) > 127;
    landMask[i] = on ? 1 : 0;
    seaMask[i] = on ? 0 : 1;
  }
  const lakePixels = read(lakes);
  await tick();

  const toLand = await distance(landMask, w, h);
  const toSea = await distance(seaMask, w, h);

  // Borders and rivers only need to be *near* something for the field, but
  // the hairlines are what is actually seen, so the distance channels are
  // kept for the shader's fade rules rather than for the line itself.
  const borders = layer();
  borders.strokeStyle = "#fff";
  borders.lineWidth = 1.4;
  borders.lineJoin = "round";
  for (const c of countries.countries) {
    for (const poly of c.polys) {
      for (const ring of poly) {
        borders.beginPath();
        trace(borders, ring, true);
        borders.stroke();
      }
    }
  }
  await tick();
  const borderPixels = read(borders);
  const borderMask = new Uint8Array(w * h);
  for (let i = 0; i < borderMask.length; i++) borderMask[i] = (borderPixels[i * 4] as number) > 60 ? 1 : 0;
  const toBorder = await distance(borderMask, w, h);

  const km = texel / 1000;
  const coastKm = new Float32Array(w * h);
  for (let i = 0; i < coastKm.length; i++) {
    const onLand = landMask[i] === 1;
    coastKm[i] = (onLand ? (toSea[i] as number) - 0.5 : -((toLand[i] as number) - 0.5)) * km;
  }

  const data = new Uint16Array(w * h * 4);
  const one = toHalf(1);
  let i = 0;
  await slice(() => {
    const end = Math.min(w * h, i + 60_000);
    for (; i < end; i++) {
      data[i * 4] = toHalf(Math.max(-1500, Math.min(1500, coastKm[i] as number)));
      data[i * 4 + 1] = toHalf(Math.min(300, (toBorder[i] as number) * km));
      data[i * 4 + 2] = one;
      data[i * 4 + 3] = toHalf((lakePixels[i * 4] as number) / 255);
    }
    return i >= w * h;
  }, 12);

  // Hairlines. A segment is coast if the sea is within about a texel and a
  // half of its middle, and a border otherwise.
  const segs: number[] = [];
  const near = 1.6 * km;
  const sample = (x: number, z: number) => {
    const ix = Math.round((x - EXTENT.x0) * k);
    const iy = Math.round((z - EXTENT.z0) * k);
    if (ix < 0 || iy < 0 || ix >= w || iy >= h) return 9999;
    return coastKm[iy * w + ix] as number;
  };
  const inside = (x: number, z: number) =>
    x > EXTENT.x0 && x < EXTENT.x1 && z > EXTENT.z0 && z < EXTENT.z1;
  const add = (ring: number[][], kindOf: (mx: number, mz: number) => number, close: boolean) => {
    const n = ring.length;
    let prev = project((ring[0] as number[])[0] as number, (ring[0] as number[])[1] as number);
    for (let j = 1; j < n + (close ? 1 : 0); j++) {
      const c = ring[j % n] as number[];
      const cur = project(c[0] as number, c[1] as number);
      if (inside(prev.x, prev.z) || inside(cur.x, cur.z)) {
        segs.push(prev.x, prev.z, cur.x, cur.z, kindOf((prev.x + cur.x) / 2, (prev.z + cur.z) / 2));
      }
      prev = cur;
    }
  };

  const ringKind = (mx: number, mz: number) => (Math.abs(sample(mx, mz)) < near ? LINE_COAST : LINE_BORDER);
  for (const c of countries.countries) {
    for (const poly of c.polys) for (const ring of poly) add(ring, ringKind, true);
  }
  for (const river of hydro.rivers) add(river.p, () => LINE_RIVER, false);
  for (const lake of hydro.lakes) add(lake.p, () => LINE_LAKE, true);

  return { width: w, height: h, data, texel, lines: new Float32Array(segs) };
}
