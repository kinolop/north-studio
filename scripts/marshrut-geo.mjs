/**
 * Builds the map data behind /work/marshrut.
 *
 *   node scripts/marshrut-geo.mjs
 *
 * Everything comes from Natural Earth (public domain), fetched from its own
 * repository and cut down to the part of Eurasia the routes cross:
 *
 *  - countries, in Natural Earth's Russian point-of-view edition, because
 *    the audience is Russian and a map that draws Crimea elsewhere would be
 *    read as an error before it was read as a map;
 *  - rivers and lakes, which the country files do not carry.
 *
 * Coordinates are thinned to what a 4.5 km-per-texel distance field can
 * show, so a 13 MB source becomes under a megabyte.
 */
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "public/marshrut/geo");
mkdirSync(out, { recursive: true });

const BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/";
const BOX = { w: 12, e: 152, s: 8, n: 76 };

const get = async (name) => {
  const res = await fetch(BASE + name);
  if (!res.ok) throw new Error(`${name}: ${res.status}`);
  return res.json();
};
const round = (v) => Math.round(v * 100) / 100;

const inBox = (coords) =>
  coords.some(([x, y]) => x >= BOX.w && x <= BOX.e && y >= BOX.s && y <= BOX.n);

/** Drops points closer than `eps` degrees to the last kept one. */
function thin(line, eps, keepClosed = false) {
  const kept = [line[0]];
  for (let i = 1; i < line.length - 1; i++) {
    const [px, py] = kept[kept.length - 1];
    if (Math.hypot(line[i][0] - px, line[i][1] - py) >= eps) kept.push(line[i]);
  }
  kept.push(keepClosed ? line[0] : line[line.length - 1]);
  return kept.map(([x, y]) => [round(x), round(y)]);
}

const extent = (ring) => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of ring) {
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  return Math.max(x1 - x0, y1 - y0);
};

const countries = [];
for (const f of (await get("ne_10m_admin_0_countries_rus.geojson")).features) {
  const polys =
    f.geometry.type === "MultiPolygon" ? f.geometry.coordinates : [f.geometry.coordinates];
  const kept = [];
  for (const poly of polys) {
    const outer = poly[0];
    if (!inBox(outer)) continue;
    // Specks of an archipelago are lost at this resolution and cost points.
    if (extent(outer) < 0.45) continue;
    const rings = [thin(outer, 0.06, true)];
    for (const hole of poly.slice(1)) {
      if (extent(hole) > 0.7) rings.push(thin(hole, 0.06, true));
    }
    kept.push(rings);
  }
  if (kept.length) {
    countries.push({ iso: f.properties.ADM0_A3 ?? f.properties.ISO_A3, name: f.properties.NAME, polys: kept });
  }
}

const rivers = [];
for (const f of (await get("ne_50m_rivers_lake_centerlines.geojson")).features) {
  if (f.properties.scalerank > 5) continue;
  const lines =
    f.geometry.type === "MultiLineString" ? f.geometry.coordinates : [f.geometry.coordinates];
  for (const line of lines) {
    if (line.length < 2 || !inBox(line)) continue;
    rivers.push({ r: f.properties.scalerank, p: thin(line, 0.06) });
  }
}

const lakes = [];
for (const f of (await get("ne_50m_lakes.geojson")).features) {
  if (f.properties.scalerank > 1) continue;
  const polys =
    f.geometry.type === "MultiPolygon" ? f.geometry.coordinates : [f.geometry.coordinates];
  for (const poly of polys) {
    const ring = poly[0];
    if (!inBox(ring) || extent(ring) < 0.55) continue;
    lakes.push({ n: f.properties.name_en ?? f.properties.name, p: thin(ring, 0.05, true) });
  }
}

writeFileSync(resolve(out, "countries.json"), JSON.stringify({ countries }));
writeFileSync(resolve(out, "hydro.json"), JSON.stringify({ rivers, lakes }));
for (const name of ["countries.json", "hydro.json"]) {
  console.log(name, (statSync(resolve(out, name)).size / 1024).toFixed(0), "KB");
}
console.log("countries", countries.length, "rivers", rivers.length, "lakes", lakes.length);
