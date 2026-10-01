import * as THREE from "three";

import { ORIGINS } from "@/lib/marshrut/data";
import { EXTENT, haversine, project } from "@/lib/marshrut/geo";
import { corridors } from "@/lib/marshrut/route";
import { mulberry32 } from "@/lib/marshrut/util";

/**
 * The lights of the towns, as the continent looks from a night flight.
 *
 * Every city is a small cluster of points scattered around its centre, more
 * of them and further out the bigger it is, so Moscow and the Pearl River
 * delta read as sprawls and a railway town as a speck. Along the roads and
 * railways the routes use, faint single points every few dozen kilometres
 * stand for the villages a trunk line strings together: from above, a
 * transport corridor at night is a dotted line of light, and that is how the
 * reader sees where freight can go before a route is drawn at all.
 *
 * Positions are fixed and seeded, so the same lights come on every visit.
 * Each point is a quad sized in screen pixels, a soft core with a faint
 * halo, added onto the ground. Matte and small on purpose: sodium and
 * tungsten, not neon.
 */

type City = readonly [lon: number, lat: number, thousands: number];

// prettier-ignore
const CITIES: readonly City[] = [
  // Russia, west of the Urals
  [37.62, 55.75, 12600], [30.32, 59.94, 5400], [49.11, 55.79, 1300], [44.0, 56.33, 1250], [50.15, 53.2, 1160],
  [39.72, 47.24, 1140], [55.97, 54.74, 1130], [39.2, 51.67, 1050], [56.25, 58.01, 1050], [44.52, 48.71, 1030],
  [38.98, 45.04, 950], [46.03, 51.53, 840], [49.42, 53.51, 700], [53.2, 56.85, 650], [48.4, 54.32, 620],
  [39.89, 57.63, 600], [47.5, 42.98, 600], [55.1, 51.77, 560], [39.74, 54.63, 530], [52.4, 55.74, 530],
  [48.03, 46.35, 520], [45.0, 53.2, 520], [49.66, 58.6, 500], [39.6, 52.61, 500], [47.25, 56.13, 490],
  [37.62, 54.19, 470], [36.19, 51.73, 450], [41.97, 45.04, 450], [39.73, 43.6, 440], [35.91, 56.86, 420],
  [40.97, 57.0, 400], [34.36, 53.24, 400], [36.59, 50.6, 390], [40.4, 56.13, 350], [40.54, 64.54, 340],
  [36.25, 54.51, 330], [32.05, 54.78, 320], [37.9, 59.13, 310], [39.89, 59.22, 310], [36.08, 52.97, 300],
  [33.08, 68.97, 280], [41.45, 52.72, 290], [55.94, 53.63, 280], [34.35, 61.79, 280], [40.93, 57.77, 270],
  [37.77, 44.72, 270], [47.89, 56.63, 280], [38.9, 47.23, 250], [50.83, 61.67, 240], [43.61, 43.49, 240],
  [31.27, 58.52, 220], [28.33, 57.82, 200], [44.78, 48.79, 320], [43.46, 56.24, 230], [40.2, 47.7, 230],
  [41.12, 44.99, 190], [44.68, 43.02, 300], [45.69, 43.32, 300], [52.3, 54.9, 160], [46.12, 51.5, 220],
  [48.47, 53.16, 170], [37.84, 51.3, 220], [40.1, 47.42, 165], [41.32, 56.36, 135], [36.6, 55.1, 120],
  [47.78, 52.03, 190], [38.3, 54.01, 120], [38.13, 56.3, 100], [37.54, 55.43, 310], [37.27, 55.96, 250],
  [38.06, 55.8, 200], [20.51, 54.71, 490], [58.57, 51.23, 230],
  // The Urals and Siberia
  [82.92, 55.03, 1630], [60.6, 56.84, 1540], [61.4, 55.16, 1190], [73.37, 54.99, 1150], [92.85, 56.01, 1100],
  [65.53, 57.15, 800], [83.76, 53.35, 630], [104.28, 52.29, 620], [84.95, 56.49, 570], [86.09, 55.35, 550],
  [87.12, 53.76, 540], [107.6, 51.83, 430], [58.98, 53.41, 410], [73.4, 61.25, 390], [113.5, 52.03, 350],
  [59.97, 57.91, 340], [65.34, 55.44, 310], [76.57, 60.94, 280], [101.63, 56.15, 230], [85.21, 52.54, 200],
  [103.88, 52.54, 220], [91.44, 53.72, 190], [81.2, 51.5, 140], [60.1, 55.05, 150], [59.67, 55.17, 160],
  [61.92, 56.41, 165], [69.0, 61.0, 100], [75.45, 63.2, 105], [76.68, 66.08, 120], [90.5, 56.27, 105],
  [95.7, 56.2, 90], [88.2, 69.35, 180], [68.25, 58.2, 100], [129.73, 62.03, 330],
  // The Far East
  [135.08, 48.48, 610], [131.89, 43.12, 600], [137.0, 50.55, 240], [127.53, 50.29, 240], [131.94, 43.8, 170],
  [132.87, 42.82, 140], [132.93, 48.79, 70], [128.47, 50.92, 65], [124.7, 55.15, 35], [123.96, 54.0, 10],
  [119.72, 53.74, 12],
  // Kazakhstan and Central Asia
  [76.95, 43.24, 2000], [71.43, 51.17, 1300], [69.6, 42.3, 1100], [73.1, 49.8, 500], [57.17, 50.28, 500],
  [71.37, 42.9, 360], [76.95, 52.29, 360], [82.61, 49.95, 330], [80.23, 50.42, 320], [51.88, 47.1, 290],
  [63.62, 53.21, 250], [65.5, 44.85, 250], [51.37, 51.23, 230], [69.15, 54.87, 220], [51.2, 43.65, 190],
  [78.37, 45.02, 140], [75.32, 51.72, 130], [72.95, 50.05, 180], [68.25, 43.3, 160], [67.71, 47.78, 90],
  [80.43, 47.97, 40], [79.65, 46.98, 10], [74.99, 46.85, 70], [69.39, 53.28, 150], [80.35, 44.2, 30],
  [82.58, 45.17, 10], [69.24, 41.3, 2900], [74.59, 42.87, 1100], [66.97, 39.65, 550], [71.67, 41.0, 630],
  [72.34, 40.78, 450], [71.79, 40.39, 300], [72.8, 40.53, 320], [64.42, 39.77, 280], [68.78, 38.56, 900],
  [69.62, 40.28, 180], [59.6, 42.46, 320], [58.38, 37.95, 900], [63.57, 39.07, 250], [61.83, 37.6, 130],
  // Mongolia
  [106.92, 47.92, 1600], [104.08, 49.03, 100], [105.95, 49.47, 80],
  // China: the Pearl River delta, then everything else
  [113.26, 23.13, 14000], [114.06, 22.54, 13000], [113.75, 23.02, 10000], [113.12, 23.02, 9500],
  [114.17, 22.32, 7400], [113.39, 22.52, 4400], [114.41, 23.11, 6000], [113.58, 22.27, 2400],
  [113.08, 22.58, 4800], [113.55, 22.2, 680],
  [121.47, 31.23, 24000], [116.4, 39.9, 21000], [106.55, 29.56, 9000], [104.07, 30.67, 14000],
  [117.2, 39.13, 13000], [114.3, 30.59, 12000], [108.94, 34.34, 12000], [120.16, 30.27, 12000],
  [118.8, 32.06, 9300], [113.65, 34.75, 12000], [120.62, 31.3, 12000], [123.43, 41.8, 9000],
  [120.38, 36.07, 10000], [112.94, 28.23, 10000], [126.64, 45.75, 10000], [117.28, 31.86, 9300],
  [102.83, 24.88, 8400], [121.6, 38.91, 7400], [117.0, 36.67, 9200], [118.09, 24.48, 5100],
  [119.3, 26.08, 8300], [125.32, 43.88, 9000], [114.51, 38.04, 11000], [108.32, 22.82, 8700],
  [112.55, 37.87, 5300], [115.86, 28.68, 6400], [106.71, 26.58, 6000], [87.62, 43.83, 4000],
  [103.83, 36.06, 4300], [121.55, 29.87, 9400], [120.3, 31.57, 7400], [117.18, 34.26, 9000],
  [120.7, 28.0, 9500], [118.18, 39.63, 7700], [109.84, 40.66, 2700], [111.75, 40.84, 3400],
  [106.23, 38.49, 2800], [101.78, 36.62, 2400], [112.45, 34.62, 7000], [114.54, 36.62, 9400],
  [118.35, 35.1, 11000], [119.16, 36.71, 9300], [121.45, 37.46, 7100], [120.86, 32.01, 7700],
  [119.97, 31.81, 5300], [120.58, 30.0, 5300], [120.07, 29.31, 7000], [121.42, 28.66, 6600],
  [118.68, 24.87, 8800], [116.68, 23.35, 5500], [110.36, 21.27, 7000], [110.33, 20.04, 2900],
  [109.41, 24.33, 4100], [110.29, 25.27, 4900], [114.93, 25.83, 9000], [112.57, 26.89, 6600],
  [113.13, 29.36, 5000], [111.29, 30.69, 4000], [112.12, 32.01, 5300], [112.53, 33.0, 9700],
  [114.39, 36.1, 5500], [113.3, 40.08, 3100], [126.55, 43.84, 3600], [123.92, 47.35, 4000],
  [125.1, 46.59, 2800], [129.63, 44.55, 2300], [122.99, 41.11, 3300], [115.46, 38.87, 11000],
  [116.84, 38.3, 7300], [118.05, 36.81, 4700], [116.59, 35.41, 8300], [115.48, 35.23, 8700],
  [115.65, 34.41, 7800], [114.7, 33.63, 9000], [115.81, 32.89, 8200], [117.39, 32.92, 3300],
  [119.02, 33.61, 4600], [120.16, 33.35, 6700], [119.22, 34.6, 4600], [118.38, 31.33, 3600],
  [117.05, 30.52, 4200], [116.0, 29.71, 4600], [117.94, 28.45, 6500], [104.68, 31.47, 4900],
  [106.08, 30.8, 5600], [106.93, 27.73, 6600], [105.72, 34.58, 3000], [107.24, 34.36, 3300],
  [107.02, 33.07, 3200], [98.5, 39.74, 1100], [100.45, 38.93, 1100], [93.5, 42.83, 600],
  [86.15, 41.76, 700], [75.99, 39.47, 700], [80.26, 41.17, 700], [81.32, 43.91, 600],
  [86.04, 44.31, 700], [84.87, 45.58, 500], [89.19, 42.95, 300], [91.11, 29.65, 800],
  [94.9, 36.4, 220], [113.6, 24.81, 2900], [116.12, 24.29, 3900], [113.06, 23.68, 4000],
  [112.47, 23.05, 4100], [110.92, 21.66, 6200], [111.28, 23.48, 2800], [113.01, 25.77, 4700],
  [113.13, 27.83, 3900], [112.94, 27.83, 2700], [111.7, 29.03, 5300], [110.0, 27.55, 4900],
  [110.15, 22.63, 5800], [105.43, 28.87, 4300], [104.62, 28.77, 4600], [103.76, 29.55, 3200],
  [101.72, 26.58, 1200], [100.23, 26.87, 1200], [114.88, 40.82, 4100], [118.93, 42.26, 4000],
  [124.35, 40.0, 2400], [121.13, 41.1, 3000], [122.24, 40.67, 2400],
  // Korea, Japan, Taiwan
  [126.98, 37.57, 25000], [129.08, 35.18, 3400], [128.6, 35.87, 2400], [127.38, 36.35, 1500],
  [126.85, 35.16, 1450], [129.31, 35.54, 1100], [127.15, 37.44, 1000], [125.75, 39.03, 300],
  [130.4, 33.59, 5500], [130.88, 33.88, 1000], [132.46, 34.39, 2000], [131.61, 33.24, 470],
  [121.56, 25.04, 7000], [120.68, 24.14, 2800], [120.31, 22.63, 2700], [120.21, 22.99, 1900],
  // South and South-East Asia at the corner of the sheet
  [105.85, 21.03, 8000], [106.68, 20.86, 2000], [120.98, 14.6, 13000], [102.6, 17.97, 900],
  [96.08, 21.97, 1500], [96.2, 16.87, 5500], [100.5, 13.75, 10000], [77.2, 28.61, 30000],
  [88.36, 22.57, 15000], [90.41, 23.81, 21000], [80.95, 26.85, 3500], [80.33, 26.45, 3000],
  [85.14, 25.59, 2300], [75.79, 26.91, 3900], [74.35, 31.55, 13000], [67.0, 24.86, 16000],
  [72.57, 23.02, 8000], [85.32, 27.72, 1400], [73.05, 33.68, 2000], [73.08, 31.42, 3200],
  [74.87, 31.63, 1200], [82.97, 25.32, 1500], [91.83, 22.36, 5000], [91.74, 26.14, 1000],
  [69.17, 34.53, 4500], [78.0, 27.18, 1700], [76.78, 30.73, 1100], [79.09, 21.15, 2900],
  // Iran, the Caucasus, Turkey, and Europe's eastern edge
  [51.39, 35.69, 9000], [59.6, 36.3, 3000], [49.87, 40.41, 2300], [44.79, 41.72, 1100],
  [44.51, 40.18, 1100], [46.29, 38.08, 1600], [51.67, 32.65, 2000], [28.98, 41.01, 15000],
  [32.85, 39.93, 5000], [27.56, 53.9, 2000], [30.52, 50.45, 3000], [36.23, 49.99, 1400],
  [35.05, 48.46, 1000], [30.73, 46.48, 1000], [24.11, 56.95, 620], [25.28, 54.69, 580],
  [24.94, 60.17, 1300], [24.75, 59.44, 450], [21.01, 52.23, 1800], [23.72, 37.98, 3100],
];

const VERT = /* glsl */ `
attribute vec2 aPos;
attribute float aSize;
attribute float aB;

uniform vec2 uRes;
uniform float uScale;

varying vec2 vUv;
varying float vB;

void main() {
  vec4 c = projectionMatrix * viewMatrix * vec4(aPos.x, 0.0, aPos.y, 1.0);
  if (c.w <= 0.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }
  float size = aSize * uScale;
  vUv = position.xy;
  vB = aB;
  gl_Position = c + vec4(position.xy * size / uRes * 2.0 * c.w, 0.0, 0.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
varying float vB;
uniform vec3 uWarm;
uniform vec3 uCream;
uniform float uFade;

void main() {
  float r2 = dot(vUv, vUv);
  if (r2 > 1.0) discard;
  float core = exp(-r2 * 14.0);
  float halo = exp(-r2 * 3.2) * 0.13;
  vec3 col = mix(uWarm, uCream, clamp(vB * 1.3 - 0.3, 0.0, 1.0) * core);
  gl_FragColor = vec4(col * (core + halo) * vB * uFade, 1.0);
}
`;

const inside = (x: number, z: number) =>
  x > EXTENT.x0 - 400_000 && x < EXTENT.x1 + 400_000 && z > EXTENT.z0 - 400_000 && z < EXTENT.z1 + 400_000;

function build(): { pos: Float32Array; size: Float32Array; bright: Float32Array; count: number } {
  const random = mulberry32(551_033_82);
  const gauss = () => {
    const u = Math.max(1e-9, random());
    const v = random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const pos: number[] = [];
  const size: number[] = [];
  const bright: number[] = [];
  const add = (x: number, z: number, s: number, b: number) => {
    if (!inside(x, z)) return;
    pos.push(x, z);
    size.push(s);
    bright.push(b);
  };

  for (const [lon, lat, k] of CITIES) {
    const at = project(lon, lat);
    const root = Math.sqrt(k);
    const n = Math.round(Math.min(140, Math.max(4, root * 1.6)));
    // Metres: a town of ten thousand is a few kilometres across, a megacity forty.
    const sigma = 1600 + root * 330;
    add(at.x, at.z, 3 + Math.min(3, root / 34), Math.min(1, 0.5 + root / 140));
    for (let i = 0; i < n; i++) {
      const r = Math.abs(gauss());
      const a = random() * Math.PI * 2;
      const d = sigma * r;
      const near = Math.exp(-r * 0.9);
      add(at.x + Math.cos(a) * d, at.z + Math.sin(a) * d, 1.5 + random() * 1.1 + near * 1.1, 0.16 + near * 0.5 + random() * 0.12);
    }
  }

  // Villages strung along the trunk lines.
  const links = corridors();
  for (const o of ORIGINS) links.push([[o.lon, o.lat], [112.94, 28.23]]);
  for (const [a, b] of links) {
    const km = haversine(a, b) / 1000;
    const steps = Math.max(1, Math.round(km / 32));
    for (let i = 1; i < steps; i++) {
      if (random() < 0.28) continue;
      const t = (i + (random() - 0.5) * 0.6) / steps;
      const lon = a[0] + (b[0] - a[0]) * t;
      const lat = a[1] + (b[1] - a[1]) * t;
      const p = project(lon, lat);
      const j = 5000;
      add(p.x + gauss() * j, p.z + gauss() * j, 1.4 + random() * 0.9, 0.12 + random() * 0.18);
    }
  }

  return {
    pos: new Float32Array(pos),
    size: new Float32Array(size),
    bright: new Float32Array(bright),
    count: size.length,
  };
}

export class CityLights {
  readonly scene = new THREE.Scene();
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private res = new THREE.Vector2(1, 1);

  constructor(look: { warm: string; cream: string }) {
    const data = build();
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]), 3),
    );
    geometry.setIndex([0, 1, 2, 0, 2, 3]);
    geometry.setAttribute("aPos", new THREE.InstancedBufferAttribute(data.pos, 2));
    geometry.setAttribute("aSize", new THREE.InstancedBufferAttribute(data.size, 1));
    geometry.setAttribute("aB", new THREE.InstancedBufferAttribute(data.bright, 1));
    geometry.instanceCount = data.count;

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uRes: { value: this.res },
        uScale: { value: 1 },
        uWarm: { value: new THREE.Color(look.warm) },
        uCream: { value: new THREE.Color(look.cream) },
        uFade: { value: 0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  /** Sizes are diameters in CSS pixels; the quad spans -1..1, so half of one is scaled per device pixel. */
  setSize(width: number, height: number) {
    this.res.set(width, height);
  }

  /**
   * `d` is the camera's distance: nearer, the clusters open up in space by
   * themselves, and each light grows a little so a town reads as streets
   * rather than dust.
   */
  render(renderer: THREE.WebGLRenderer, camera: THREE.Camera, fade: number, d: number, dpr: number) {
    if (fade < 0.004) return;
    const zoom = Math.min(1.9, Math.max(0.8, Math.pow(6e6 / Math.max(1, d), 0.22)));
    this.material.uniforms.uFade!.value = fade;
    this.material.uniforms.uScale!.value = dpr * 0.5 * zoom;
    renderer.render(this.scene, camera);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
