/**
 * The map's geometry, in one place.
 *
 * A single projection is shared by the rasteriser that builds the distance
 * fields, the shader that draws them, the routes, the labels and the cursor
 * readout. If two of them disagreed by a pixel the route would drift off the
 * roads it is meant to follow, so none of them has its own copy of the maths.
 *
 * The projection is a Lambert conformal conic: straight-ish meridians that
 * converge to the north, the classic choice for an atlas plate of Eurasia,
 * and one with a closed-form inverse, which the shader needs.
 *
 * World coordinates are metres on the plate with the origin on Guangzhou and
 * north toward -Z. The pallet at the start of the journey sits on that
 * origin, so everything that is drawn small (the cargo, the truck) has small
 * coordinates and keeps its float precision; the far end of the route is
 * thousands of kilometres away, where nothing needs to be exact to a metre.
 */

export const EARTH_R = 6_371_000;
const RAD = Math.PI / 180;

/** Central meridian and standard parallels of the cone, in degrees. */
export const LAM0 = 78;
export const PHI1 = 32;
export const PHI2 = 58;

const tany = (y: number) => Math.tan((Math.PI / 2 + y) / 2);

/** Cone constant and scale factor of the projection (see Snyder, 1987). */
export const CONE_N =
  Math.log(Math.cos(PHI1 * RAD) / Math.cos(PHI2 * RAD)) /
  Math.log(tany(PHI2 * RAD) / tany(PHI1 * RAD));
export const CONE_F =
  (Math.cos(PHI1 * RAD) * Math.pow(tany(PHI1 * RAD), CONE_N)) / CONE_N;

/** Projected metres before the origin shift; y points down, as on a screen. */
function raw(lon: number, lat: number): [number, number] {
  const l = (lon - LAM0) * RAD;
  const r = CONE_F / Math.pow(tany(lat * RAD), CONE_N);
  return [
    EARTH_R * r * Math.sin(CONE_N * l),
    -EARTH_R * (CONE_F - r * Math.cos(CONE_N * l)),
  ];
}

export const ORIGIN_LONLAT: readonly [number, number] = [113.26, 23.13];
const G = raw(ORIGIN_LONLAT[0], ORIGIN_LONLAT[1]);

/** Where the projection puts the world origin, for the shader's inverse. */
export const ORIGIN_SHIFT: readonly [number, number] = [G[0], G[1]];

export interface Plane {
  x: number;
  z: number;
}

export function project(lon: number, lat: number): Plane {
  const p = raw(lon, lat);
  return { x: p[0] - G[0], z: p[1] - G[1] };
}

export function unproject(x: number, z: number): [number, number] {
  const sx = (x + G[0]) / EARTH_R;
  const y = -(z + G[1]) / EARTH_R;
  const fy = CONE_F - y;
  const r = Math.sqrt(sx * sx + fy * fy);
  const l = Math.atan2(sx, fy);
  return [
    l / CONE_N / RAD + LAM0,
    (2 * Math.atan(Math.pow(CONE_F / r, 1 / CONE_N)) - Math.PI / 2) / RAD,
  ];
}

/**
 * The rectangle the distance fields cover, in world metres. Everything the
 * routes touch is well inside it; outside, the plate fades into plain paper.
 */
export const EXTENT = {
  x0: -8_000_000,
  x1: 1_600_000,
  z0: -5_600_000,
  z1: 1_600_000,
} as const;

export function haversine(a: readonly [number, number], b: readonly [number, number]): number {
  const dLat = (b[1] - a[1]) * RAD;
  const dLon = (b[0] - a[0]) * RAD;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[1] * RAD) * Math.cos(b[1] * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** Points along the great circle between two places, ends included. */
export function greatCircle(
  a: readonly [number, number],
  b: readonly [number, number],
  steps: number,
): [number, number][] {
  const toVec = (p: readonly [number, number]) => {
    const lo = p[0] * RAD;
    const la = p[1] * RAD;
    return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)] as const;
  };
  const va = toVec(a);
  const vb = toVec(b);
  const dot = Math.min(1, Math.max(-1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]));
  const omega = Math.acos(dot);
  const out: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const sa = omega === 0 ? 1 - t : Math.sin((1 - t) * omega) / Math.sin(omega);
    const sb = omega === 0 ? t : Math.sin(t * omega) / Math.sin(omega);
    const x = sa * va[0] + sb * vb[0];
    const y = sa * va[1] + sb * vb[1];
    const z = sa * va[2] + sb * vb[2];
    out.push([Math.atan2(y, x) / RAD, Math.asin(z / Math.hypot(x, y, z)) / RAD]);
  }
  return out;
}

/* -------------------------------------------------------------- lettering */

export interface Place {
  id: string;
  name: string;
  lon: number;
  lat: number;
  /** 1 = always labelled, 3 = only once the map is close enough to read. */
  rank: 1 | 2 | 3;
}

export const PLACES: readonly Place[] = [
  { id: "moscow", name: "Москва", lon: 37.62, lat: 55.75, rank: 1 },
  { id: "spb", name: "Санкт-Петербург", lon: 30.32, lat: 59.94, rank: 1 },
  { id: "kazan", name: "Казань", lon: 49.11, lat: 55.79, rank: 2 },
  { id: "krasnodar", name: "Краснодар", lon: 38.98, lat: 45.04, rank: 2 },
  { id: "ekb", name: "Екатеринбург", lon: 60.6, lat: 56.84, rank: 2 },
  { id: "novosibirsk", name: "Новосибирск", lon: 82.92, lat: 55.03, rank: 2 },
  { id: "krasnoyarsk", name: "Красноярск", lon: 92.85, lat: 56.01, rank: 3 },
  { id: "irkutsk", name: "Иркутск", lon: 104.28, lat: 52.29, rank: 3 },
  { id: "chita", name: "Чита", lon: 113.5, lat: 52.03, rank: 3 },
  { id: "khabarovsk", name: "Хабаровск", lon: 135.08, lat: 48.48, rank: 3 },
  { id: "vladivostok", name: "Владивосток", lon: 131.89, lat: 43.12, rank: 2 },
  { id: "samara", name: "Самара", lon: 50.15, lat: 53.2, rank: 3 },
  { id: "omsk", name: "Омск", lon: 73.37, lat: 54.99, rank: 3 },
  { id: "chelyabinsk", name: "Челябинск", lon: 61.4, lat: 55.16, rank: 3 },
  { id: "orenburg", name: "Оренбург", lon: 55.1, lat: 51.77, rank: 3 },
  { id: "rostov", name: "Ростов-на-Дону", lon: 39.72, lat: 47.24, rank: 3 },
  { id: "murmansk", name: "Мурманск", lon: 33.08, lat: 68.97, rank: 3 },
  { id: "astana", name: "Астана", lon: 71.43, lat: 51.17, rank: 2 },
  { id: "almaty", name: "Алматы", lon: 76.95, lat: 43.24, rank: 2 },
  { id: "aktobe", name: "Актобе", lon: 57.17, lat: 50.28, rank: 3 },
  { id: "tashkent", name: "Ташкент", lon: 69.24, lat: 41.3, rank: 3 },
  { id: "ulaanbaatar", name: "Улан-Батор", lon: 106.92, lat: 47.92, rank: 2 },
  { id: "urumqi", name: "Урумчи", lon: 87.62, lat: 43.83, rank: 2 },
  { id: "lanzhou", name: "Ланьчжоу", lon: 103.83, lat: 36.06, rank: 3 },
  { id: "xian", name: "Сиань", lon: 108.94, lat: 34.34, rank: 3 },
  { id: "wuhan", name: "Ухань", lon: 114.3, lat: 30.59, rank: 3 },
  { id: "beijing", name: "Пекин", lon: 116.4, lat: 39.9, rank: 1 },
  { id: "shanghai", name: "Шанхай", lon: 121.47, lat: 31.23, rank: 1 },
  { id: "yiwu", name: "Иу", lon: 120.07, lat: 29.31, rank: 2 },
  { id: "guangzhou", name: "Гуанчжоу", lon: 113.26, lat: 23.13, rank: 1 },
  { id: "harbin", name: "Харбин", lon: 126.64, lat: 45.75, rank: 3 },
];

export interface Region {
  name: string;
  lon: number;
  lat: number;
  /** Water is set in italic, countries in spaced capitals. */
  kind: "country" | "water";
  /** Rotation on the plate, in degrees, so the name follows the coast. */
  angle?: number;
}

export const REGIONS: readonly Region[] = [
  { name: "Россия", lon: 96, lat: 61.5, kind: "country" },
  { name: "Казахстан", lon: 67.5, lat: 47.6, kind: "country" },
  { name: "Китай", lon: 100, lat: 33.5, kind: "country" },
  { name: "Монголия", lon: 103, lat: 46.6, kind: "country" },
  { name: "Каспийское море", lon: 51.2, lat: 41.8, kind: "water", angle: -8 },
  { name: "Японское море", lon: 135.8, lat: 40.2, kind: "water", angle: 70 },
  { name: "Южно-Китайское море", lon: 114.5, lat: 15.5, kind: "water" },
  { name: "Восточно-Китайское море", lon: 126.6, lat: 27.2, kind: "water", angle: 45 },
  { name: "Баренцево море", lon: 40, lat: 72.8, kind: "water" },
  { name: "Чёрное море", lon: 34.5, lat: 43.3, kind: "water" },
];
