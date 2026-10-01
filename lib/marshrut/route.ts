/**
 * From a choice of origin, mode and warehouse to a line on the plate.
 *
 * The roads and railways are a small graph of real places joined by chains
 * that follow the real corridors (the Western China road through Khorgos,
 * the rail through Dostyk, the Trans-Siberian from Vladivostok). A shortest
 * path through that graph picks the way to each warehouse, and a
 * centripetal Catmull-Rom curve turns the list of towns into something a
 * ribbon can follow without kinks. Sea lanes are hand-placed around the
 * coasts they hug, and the air route is a great circle lifted off the plate.
 *
 * The result is split into three legs at the customs gate, because that is
 * where the money changes character: what it costs to move goods, what it
 * costs to let them in, and what it costs to carry them the rest of the way.
 */

import {
  DESTINATIONS,
  MODES,
  ORIGINS,
  byId,
  type DestId,
  type ModeId,
  type OriginId,
} from "./data";
import { greatCircle, haversine, project, unproject, type Plane } from "./geo";
import { at, clamp } from "./util";

type LonLat = readonly [number, number];

const NODES: Record<string, LonLat> = {
  // China
  changsha: [112.94, 28.23],
  wuhan: [114.3, 30.59],
  zhengzhou: [113.65, 34.75],
  xian: [108.94, 34.34],
  lanzhou: [103.83, 36.06],
  jiuquan: [98.5, 39.74],
  hami: [93.5, 42.83],
  urumqi: [87.62, 43.83],
  hefei: [117.28, 31.86],
  nanjing: [118.8, 32.06],
  // The customs union's front door
  khorgos: [80.35, 44.2],
  dostyk: [82.58, 45.17],
  vladivostok: [131.9, 43.12],
  // Kazakhstan
  almaty: [76.95, 43.24],
  taraz: [71.37, 42.9],
  shymkent: [69.6, 42.3],
  kyzylorda: [65.5, 44.85],
  aktobe: [57.17, 50.28],
  aktogay: [79.65, 46.98],
  ayagoz: [80.43, 47.97],
  semey: [80.23, 50.42],
  astana: [71.43, 51.17],
  petropavlovsk: [69.15, 54.87],
  // Russia
  orenburg: [55.1, 51.77],
  samara: [50.15, 53.2],
  penza: [45.0, 53.2],
  ryazan: [39.75, 54.63],
  ulyanovsk: [48.4, 54.32],
  saratov: [46.03, 51.53],
  volgograd: [44.52, 48.71],
  rostov: [39.72, 47.24],
  ufa: [55.97, 54.74],
  chelyabinsk: [61.4, 55.16],
  kurgan: [65.34, 55.44],
  omsk: [73.37, 54.99],
  tyumen: [65.53, 57.15],
  barnaul: [83.76, 53.35],
  tver: [35.91, 56.86],
  novgorod: [31.27, 58.52],
  agryz: [52.99, 56.51],
  perm: [56.25, 58.01],
  kirov: [49.66, 58.6],
  yaroslavl: [39.89, 57.63],
  moscow: [37.62, 55.75],
  krasnoyarsk: [92.85, 56.01],
  irkutsk: [104.28, 52.29],
  ulanude: [107.6, 51.83],
  chita: [113.5, 52.03],
  mogocha: [119.72, 53.74],
  skovorodino: [123.96, 54.0],
  belogorsk: [128.47, 50.92],
  khabarovsk: [135.08, 48.48],
  ussuriysk: [131.94, 43.8],
  // The six warehouses double as junctions.
  ...Object.fromEntries(DESTINATIONS.map((d) => [d.id, [d.lon, d.lat] as LonLat])),
};

const node = (id: string): LonLat => {
  const found = NODES[id];
  if (!found) throw new Error(`no such node: ${id}`);
  return found;
};

/** Display names of the junctions worth printing on a timetable. */
const STATION: Record<string, string> = {
  wuhan: "Ухань",
  xian: "Сиань",
  urumqi: "Урумчи",
  khorgos: "Хоргос",
  dostyk: "Достык",
  almaty: "Алматы",
  shymkent: "Шымкент",
  aktobe: "Актобе",
  astana: "Астана",
  petropavlovsk: "Петропавловск",
  orenburg: "Оренбург",
  samara: "Самара",
  chelyabinsk: "Челябинск",
  ufa: "Уфа",
  omsk: "Омск",
  novosibirsk: "Новосибирск",
  krasnoyarsk: "Красноярск",
  irkutsk: "Иркутск",
  chita: "Чита",
  khabarovsk: "Хабаровск",
  ekb: "Екатеринбург",
  perm: "Пермь",
  kirov: "Киров",
  yaroslavl: "Ярославль",
  moscow: "Москва",
  saratov: "Саратов",
  volgograd: "Волгоград",
  rostov: "Ростов",
  ryazan: "Рязань",
  tver: "Тверь",
  kazan: "Казань",
};

/* ---------------------------------------------------------------- graph */

const ROAD_CHAINS: string[][] = [
  ["khorgos", "almaty", "taraz", "shymkent", "kyzylorda", "aktobe", "orenburg", "samara", "penza", "ryazan", "koledino"],
  ["samara", "ulyanovsk", "kazan"],
  ["samara", "saratov", "volgograd", "rostov", "krasnodar"],
  ["orenburg", "ufa", "chelyabinsk", "ekb"],
  ["koledino", "tver", "novgorod", "spb"],
  ["khorgos", "ayagoz", "semey", "barnaul", "novosibirsk"],
];

const RAIL_CHAINS: string[][] = [
  ["dostyk", "aktogay", "astana", "petropavlovsk", "kurgan", "chelyabinsk", "ufa", "samara", "penza", "ryazan", "koledino"],
  ["aktogay", "semey", "barnaul", "novosibirsk"],
  ["petropavlovsk", "omsk", "novosibirsk"],
  ["chelyabinsk", "ekb"],
  ["samara", "ulyanovsk", "kazan"],
  ["samara", "saratov", "volgograd", "rostov", "krasnodar"],
  ["koledino", "tver", "spb"],
  // The Trans-Siberian, from the Pacific to Moscow.
  ["vladivostok", "ussuriysk", "khabarovsk", "belogorsk", "skovorodino", "mogocha", "chita", "ulanude", "irkutsk", "krasnoyarsk", "novosibirsk", "omsk", "tyumen", "ekb", "perm", "kirov", "yaroslavl", "moscow", "koledino"],
  ["moscow", "tver", "spb"],
  ["ekb", "agryz", "kazan"],
];

type Graph = Map<string, Map<string, number>>;

function buildGraph(chains: string[][]): Graph {
  const graph: Graph = new Map();
  const link = (a: string, b: string) => {
    const d = haversine(node(a), node(b));
    if (!graph.has(a)) graph.set(a, new Map());
    if (!graph.has(b)) graph.set(b, new Map());
    graph.get(a)?.set(b, d);
    graph.get(b)?.set(a, d);
  };
  for (const chain of chains) {
    for (let i = 1; i < chain.length; i++) link(at(chain, i - 1), at(chain, i));
  }
  return graph;
}

const ROAD = buildGraph(ROAD_CHAINS);
const RAIL = buildGraph(RAIL_CHAINS);

function shortest(graph: Graph, from: string, to: string): string[] {
  const dist = new Map<string, number>([[from, 0]]);
  const prev = new Map<string, string>();
  const open = new Set<string>([from]);
  while (open.size) {
    let current = "";
    let best = Infinity;
    for (const id of open) {
      const d = dist.get(id) ?? Infinity;
      if (d < best) {
        best = d;
        current = id;
      }
    }
    if (current === to) break;
    open.delete(current);
    for (const [next, w] of graph.get(current) ?? []) {
      const d = best + w;
      if (d < (dist.get(next) ?? Infinity)) {
        dist.set(next, d);
        prev.set(next, current);
        open.add(next);
      }
    }
  }
  const path = [to];
  while (path[0] !== from) {
    const before = prev.get(at(path, 0));
    if (!before) throw new Error(`no route ${from} to ${to}`);
    path.unshift(before);
  }
  return path;
}

/* ------------------------------------------------------- China and the sea */

const CN_TAIL = ["xian", "lanzhou", "jiuquan", "hami", "urumqi"];
const CN_HEAD: Record<OriginId, string[]> = {
  guangzhou: ["changsha", "wuhan", "zhengzhou"],
  yiwu: ["hefei", "zhengzhou"],
  shanghai: ["nanjing", "hefei", "zhengzhou"],
};

/** Open water from each port to the mouth of Peter the Great Bay. */
const SEA_LANE: Record<OriginId, LonLat[]> = {
  guangzhou: [[114.7, 21.9], [116.8, 22.7], [119.2, 24.3], [121.1, 26.7], [122.8, 29.6], [124.9, 32.0], [127.6, 32.7], [129.0, 34.2], [130.6, 36.0], [131.6, 38.6], [132.2, 41.4]],
  yiwu: [[123.3, 30.5], [125.4, 32.3], [127.6, 32.7], [129.0, 34.2], [130.6, 36.0], [131.6, 38.6], [132.2, 41.4]],
  shanghai: [[123.6, 30.9], [125.6, 32.4], [127.6, 32.7], [129.0, 34.2], [130.6, 36.0], [131.6, 38.6], [132.2, 41.4]],
};

/* ------------------------------------------------------------- the result */

export type LegKind = "road" | "rail" | "sea" | "air" | "gate" | "local";

export interface RouteLeg {
  id: "main" | "customs" | "inland";
  kind: LegKind;
  /** Drawn line, uniform samples, plate metres. */
  points: Plane[];
  /** Arc length along the whole route where this leg starts and ends. */
  s0: number;
  s1: number;
  /** Ground distance, kilometres. */
  km: number;
}

export interface RoutePlace {
  name: string;
  lon: number;
  lat: number;
  x: number;
  z: number;
  /** Arc length of this place along the route. */
  s: number;
}

export interface RouteStop {
  name: string;
  /** Arc length along the route, plate metres. */
  s: number;
}

export interface RoutePlan {
  origin: RoutePlace;
  gate: RoutePlace;
  dest: RoutePlace;
  points: Plane[];
  /** Height above the plate per sample, metres. Only a flight leaves the ground. */
  lift: number[];
  /** Arc length at each sample, plate metres. */
  cum: number[];
  length: number;
  legs: [RouteLeg, RouteLeg, RouteLeg];
  /** The places worth naming between the two ends, in order. */
  stops: RouteStop[];
  kmTotal: number;
  mode: ModeId;
}

const STEP = 16_000;

/** Centripetal Catmull-Rom through the plate points, sampled about every `step` metres. */
function spline(control: Plane[], step: number): { points: Plane[]; at: number[] } {
  const out: Plane[] = [];
  const marks: number[] = [];
  let arc = 0;
  const last = control.length - 1;
  const pt = (i: number) => at(control, clamp(i, 0, last));
  for (let i = 0; i < last; i++) {
    const p0 = pt(i - 1);
    const p1 = pt(i);
    const p2 = pt(i + 1);
    const p3 = pt(i + 2);
    const d01 = Math.max(1, Math.pow(Math.hypot(p1.x - p0.x, p1.z - p0.z), 0.5));
    const d12 = Math.max(1, Math.pow(Math.hypot(p2.x - p1.x, p2.z - p1.z), 0.5));
    const d23 = Math.max(1, Math.pow(Math.hypot(p3.x - p2.x, p3.z - p2.z), 0.5));
    const chord = Math.hypot(p2.x - p1.x, p2.z - p1.z);
    const n = Math.max(2, Math.ceil(chord / step));
    marks.push(arc);
    let prev: Plane | null = null;
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const eval1 = (a: number, b: number, c: number, d: number) => {
        // Barry-Goldman pyramid on the non-uniform knots of the centripetal form.
        const t0 = 0;
        const t1 = t0 + d01;
        const t2 = t1 + d12;
        const t3 = t2 + d23;
        const u = t1 + (t2 - t1) * t;
        const a1 = ((t1 - u) / (t1 - t0)) * a + ((u - t0) / (t1 - t0)) * b;
        const a2 = ((t2 - u) / (t2 - t1)) * b + ((u - t1) / (t2 - t1)) * c;
        const a3 = ((t3 - u) / (t3 - t2)) * c + ((u - t2) / (t3 - t2)) * d;
        const b1 = ((t2 - u) / (t2 - t0)) * a1 + ((u - t0) / (t2 - t0)) * a2;
        const b2 = ((t3 - u) / (t3 - t1)) * a2 + ((u - t1) / (t3 - t1)) * a3;
        return ((t2 - u) / (t2 - t1)) * b1 + ((u - t1) / (t2 - t1)) * b2;
      };
      const p: Plane = {
        x: eval1(p0.x, p1.x, p2.x, p3.x),
        z: eval1(p0.z, p1.z, p2.z, p3.z),
      };
      if (prev) arc += Math.hypot(p.x - prev.x, p.z - prev.z);
      out.push(p);
      prev = p;
    }
    if (prev) arc += Math.hypot(p2.x - prev.x, p2.z - prev.z);
  }
  out.push(pt(last));
  marks.push(arc);
  return { points: out, at: marks };
}

function cumulative(points: Plane[]): number[] {
  const cum = [0];
  for (let i = 1; i < points.length; i++) {
    const a = at(points, i - 1);
    const b = at(points, i);
    cum.push(at(cum, i - 1) + Math.hypot(b.x - a.x, b.z - a.z));
  }
  return cum;
}

/** The part of a polyline between two arc lengths, ends interpolated. */
function slice(points: Plane[], cum: number[], s0: number, s1: number): Plane[] {
  const out: Plane[] = [];
  const pointAt = (s: number): Plane => {
    let lo = 0;
    let hi = cum.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (at(cum, mid) <= s) lo = mid;
      else hi = mid;
    }
    const c0 = at(cum, lo);
    const c1 = at(cum, hi);
    const t = c1 === c0 ? 0 : clamp((s - c0) / (c1 - c0), 0, 1);
    const a = at(points, lo);
    const b = at(points, hi);
    return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t };
  };
  out.push(pointAt(s0));
  for (let i = 0; i < points.length; i++) {
    const c = at(cum, i);
    if (c > s0 && c < s1) out.push(at(points, i));
  }
  out.push(pointAt(s1));
  return out;
}

function groundKm(points: Plane[]): number {
  let total = 0;
  let prev: [number, number] | null = null;
  for (const p of points) {
    const ll = unproject(p.x, p.z);
    if (prev) total += haversine(prev, ll);
    prev = ll;
  }
  return total / 1000;
}

const cache = new Map<string, RoutePlan>();

export function buildRoute(originId: OriginId, mode: ModeId, destId: DestId): RoutePlan {
  const key = `${originId}|${mode}|${destId}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const origin = byId(ORIGINS, originId);
  const dest = byId(DESTINATIONS, destId);
  const modeInfo = byId(MODES, mode);
  const originLL: LonLat = [origin.lon, origin.lat];
  const destLL: LonLat = [dest.lon, dest.lat];

  let waypoints: LonLat[];
  let ids: (string | null)[];
  let gateIndex: number;
  let gateName: string;
  let gateLL: LonLat;
  let mainKind: LegKind;
  let inlandKind: LegKind;
  let dense = false;

  if (mode === "air") {
    const airLL: LonLat = [dest.airport.lon, dest.airport.lat];
    const arc = greatCircle(originLL, airLL, 80);
    waypoints = [...arc, destLL];
    ids = waypoints.map(() => null);
    gateIndex = waypoints.length - 2;
    gateName = `Аэропорт ${dest.airport.name}`;
    gateLL = airLL;
    mainKind = "air";
    inlandKind = "road";
    dense = true;
  } else if (mode === "sea") {
    const port: LonLat = [origin.port.lon, origin.port.lat];
    const gate = node("vladivostok");
    const inland = shortest(RAIL, "vladivostok", destId).slice(1).map(node);
    const inlandIds = shortest(RAIL, "vladivostok", destId).slice(1);
    waypoints = [originLL, port, ...SEA_LANE[originId], gate, ...inland];
    ids = [null, null, ...SEA_LANE[originId].map(() => null), "vladivostok", ...inlandIds];
    gateIndex = 2 + SEA_LANE[originId].length;
    gateName = "Порт Владивосток";
    gateLL = gate;
    mainKind = "sea";
    inlandKind = "rail";
  } else {
    const gateId = mode === "road" ? "khorgos" : "dostyk";
    const graph = mode === "road" ? ROAD : RAIL;
    const china = [...CN_HEAD[originId], ...CN_TAIL].map(node);
    const inlandIds = shortest(graph, gateId, destId).slice(1);
    const inland = inlandIds.map(node);
    gateLL = node(gateId);
    waypoints = [originLL, ...china, gateLL, ...inland];
    ids = [null, ...[...CN_HEAD[originId], ...CN_TAIL], gateId, ...inlandIds];
    gateIndex = 1 + china.length;
    gateName = modeInfo.gate;
    mainKind = mode;
    inlandKind = mode;
  }

  const control = waypoints.map(([lon, lat]) => project(lon, lat));
  let points: Plane[];
  let marks: number[];
  if (dense) {
    points = control;
    marks = cumulative(points);
  } else {
    const curve = spline(control, STEP);
    points = curve.points;
    marks = curve.at;
  }
  const cum = cumulative(points);
  const length = at(cum, cum.length - 1);

  // Where along the drawn line is each waypoint we care about?
  const sOf = (waypoint: number) => {
    if (dense) return at(marks, waypoint);
    return at(marks, Math.min(waypoint, marks.length - 1));
  };
  const sGate = sOf(gateIndex);
  const sOrigin = 0;
  const sDest = length;

  const mainLen = sGate;
  const inlandLen = length - sGate;
  const half = Math.min(110_000, 0.2 * Math.min(mainLen, inlandLen));
  const s1 = sGate - half;
  const s2 = sGate + half;

  const lift: number[] = points.map((_, i) => {
    if (mode !== "air") return 0;
    const s = at(cum, i);
    if (s >= sGate) return 0;
    const t = s / sGate;
    return 4 * t * (1 - t) * 0.06 * sGate;
  });

  const legPoints = [
    slice(points, cum, 0, s1),
    slice(points, cum, s1, s2),
    slice(points, cum, s2, length),
  ] as const;

  const legs: [RouteLeg, RouteLeg, RouteLeg] = [
    { id: "main", kind: mainKind, points: legPoints[0], s0: 0, s1, km: groundKm(legPoints[0]) },
    { id: "customs", kind: "gate", points: legPoints[1], s0: s1, s1: s2, km: groundKm(legPoints[1]) },
    { id: "inland", kind: inlandKind, points: legPoints[2], s0: s2, s1: length, km: groundKm(legPoints[2]) },
  ];

  // Stops: named junctions along the way, thinned so no two crowd each other.
  const stops: RouteStop[] = [];
  let lastS = 0;
  ids.forEach((id, k) => {
    const name = id ? STATION[id] : undefined;
    if (!name) return;
    const at = sOf(k);
    if (at < 0.07 * length || at > 0.93 * length) return;
    if (Math.abs(at - sGate) < 0.06 * length) return;
    if (at - lastS < 0.1 * length) return;
    stops.push({ name, s: at });
    lastS = at;
  });

  const placeOf = (name: string, ll: LonLat, s: number): RoutePlace => {
    const p = project(ll[0], ll[1]);
    return { name, lon: ll[0], lat: ll[1], x: p.x, z: p.z, s };
  };

  const plan: RoutePlan = {
    origin: placeOf(origin.name, originLL, sOrigin),
    gate: placeOf(gateName, gateLL, sGate),
    dest: placeOf(dest.name, destLL, sDest),
    points,
    lift,
    cum,
    length,
    legs,
    stops,
    kmTotal: legs[0].km + legs[1].km + legs[2].km,
    mode,
  };
  cache.set(key, plan);
  return plan;
}

/** Position, heading and height of something travelling `s` metres along the route. */
export function along(plan: RoutePlan, s: number): { x: number; z: number; heading: number; lift: number } {
  const target = clamp(s, 0, plan.length);
  let lo = 0;
  let hi = plan.cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (at(plan.cum, mid) <= target) lo = mid;
    else hi = mid;
  }
  const c0 = at(plan.cum, lo);
  const c1 = at(plan.cum, hi);
  const t = c1 === c0 ? 0 : clamp((target - c0) / (c1 - c0), 0, 1);
  const a = at(plan.points, lo);
  const b = at(plan.points, hi);
  const l0 = at(plan.lift, lo);
  const l1 = at(plan.lift, hi);
  return {
    x: a.x + (b.x - a.x) * t,
    z: a.z + (b.z - a.z) * t,
    heading: Math.atan2(b.z - a.z, b.x - a.x),
    lift: l0 + (l1 - l0) * t,
  };
}

/**
 * Every road and railway the routes can take, as pairs of places: on the
 * night map they are the strings of small lights that the towns along a
 * trunk line make when seen from above.
 */
export function corridors(): [LonLat, LonLat][] {
  const out: [LonLat, LonLat][] = [];
  const seen = new Set<string>();
  const add = (a: string, b: string) => {
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push([node(a), node(b)]);
  };
  for (const chain of [...ROAD_CHAINS, ...RAIL_CHAINS]) {
    for (let i = 1; i < chain.length; i++) add(at(chain, i - 1), at(chain, i));
  }
  for (const head of Object.values(CN_HEAD)) {
    const chain = [...head, ...CN_TAIL, "khorgos"];
    for (let i = 1; i < chain.length; i++) add(at(chain, i - 1), at(chain, i));
  }
  add("urumqi", "dostyk");
  return out;
}
