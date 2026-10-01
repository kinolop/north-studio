import * as THREE from "three";

import { along, type RoutePlan } from "@/lib/marshrut/route";
import { clamp01, seg, smoother } from "@/lib/marshrut/util";

/**
 * A container train that follows the line.
 *
 * Not one model scaled up but a consist: a locomotive and a string of
 * flatcars, each carrying a container, each placed on its own stretch of the
 * route and turned to the line's heading there. So on the map the train
 * bends round the curves of the corridor like a real one, and its length
 * says "train" before any detail can be read.
 *
 * Built at true size in metres (a 40-foot box on a 14 m flatcar) and scaled
 * as a whole by the engine, the same way the truck is, so it stays legible
 * from any height. The containers come in the muted colours of a real
 * consist, with every fourth one in the company's own graphite.
 */

const CAR = 14.2;
const GAP = 0.8;
const LOCO = 21;
const CARS = 9;
/** Seen from orbit a true-proportion train is a hairline; it is drawn a little broader and taller than it is long. */
const BROAD = 1.9;
const TALL = 1.3;

const COLOURS = ["#7a3b2c", "#3c4a3f", "#59616b", "#2a2c30", "#8a6a3b", "#45556b", "#6b2f2a", "#2a2c30"];

const mat = (color: string, rough = 0.7, metal = 0.15) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });

/** Corrugation on a container's side, as a tiling bump of light and shade. */
function ribTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 8;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 64, 0);
  for (let i = 0; i <= 8; i++) {
    g.addColorStop(i / 8, i % 2 ? "#9a9a9a" : "#ffffff");
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 8);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(6, 1);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export class TrainConsist {
  readonly group = new THREE.Group();
  private cars: THREE.Group[] = [];
  private disposables: { dispose(): void }[] = [];
  private beam: THREE.Mesh;

  constructor(beamTexture: THREE.Texture) {
    const ribs = ribTexture();
    this.disposables.push(ribs);
    const dark = mat("#1b1d20", 0.8, 0.3);
    const deck = mat("#2a2c2f", 0.75, 0.4);
    this.disposables.push(dark, deck);

    // Locomotive: a long body, a lit cab, a band of the route's amber.
    const loco = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(LOCO - 1, 3.2, 3.0), mat("#2b2d31", 0.55, 0.35));
    body.position.set(0, 2.6, 0);
    const nose = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.6, 3.0), mat("#2b2d31", 0.55, 0.35));
    nose.position.set(LOCO / 2 - 0.6, 2.3, 0);
    const band = new THREE.Mesh(new THREE.BoxGeometry(LOCO - 0.9, 0.35, 3.04), mat("#dc9f4b", 0.5, 0.1));
    band.position.set(0, 1.55, 0);
    const glassMat = new THREE.MeshStandardMaterial({ color: "#f3e3c2", emissive: "#f0c890", emissiveIntensity: 0.9 });
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 2.4), glassMat);
    glass.position.set(LOCO / 2 + 0.52, 3.2, 0);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.5), new THREE.MeshBasicMaterial({ color: "#fff4dc" }));
    lamp.position.set(LOCO / 2 + 0.52, 1.6, 0);
    const bogies = new THREE.Mesh(new THREE.BoxGeometry(LOCO - 3, 0.9, 2.4), dark);
    bogies.position.set(0, 0.55, 0);
    loco.add(body, nose, band, glass, lamp, bogies);
    // The headlight on the line ahead.
    this.beam = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        map: beamTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.55,
      }),
    );
    this.beam.scale.set(70, 1, 16);
    this.beam.position.set(LOCO / 2 + 35, 0.08, 0);
    loco.add(this.beam);
    this.group.add(loco);
    this.cars.push(loco);

    for (let i = 0; i < CARS; i++) {
      const car = new THREE.Group();
      const flat = new THREE.Mesh(new THREE.BoxGeometry(CAR, 0.35, 2.6), deck);
      flat.position.set(0, 1.15, 0);
      const wheels = new THREE.Mesh(new THREE.BoxGeometry(CAR - 2, 0.8, 2.2), dark);
      wheels.position.set(0, 0.5, 0);
      const colour = COLOURS[i % COLOURS.length]!;
      const side = new THREE.MeshStandardMaterial({ color: colour, roughness: 0.7, metalness: 0.2, map: ribs });
      const box = new THREE.Mesh(new THREE.BoxGeometry(12.2, 2.6, 2.44), side);
      box.position.set(0, 2.62, 0);
      this.disposables.push(side);
      car.add(flat, wheels, box);
      this.group.add(car);
      this.cars.push(car);
    }
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) this.disposables.push(m.geometry);
    });
  }

  /**
   * Places the consist with its locomotive at `s` metres along the route.
   * `appear` (0.45..1) brings it in: the locomotive first, then the cars one
   * after another. A car whose place is still behind the start of the line
   * is in the terminal and is not drawn; it comes out as the train pulls away.
   */
  update(route: RoutePlan, s: number, scale: number, appear = 1) {
    let offset = 0;
    this.cars.forEach((car, i) => {
      const len = i === 0 ? LOCO : CAR;
      const at = s - (offset + len / 2) * scale;
      offset += len + GAP;
      const grow = smoother(seg(appear, 0.45 + i * 0.045, 0.62 + i * 0.045));
      const out = i === 0 ? 1 : clamp01(at / (len * scale * 0.5) + 1);
      const k = Math.min(grow, out);
      car.visible = k > 0.002;
      if (!car.visible) return;
      const p = along(route, Math.max(0, at));
      car.position.set(p.x, p.lift, p.z);
      car.rotation.y = -p.heading;
      car.scale.set(scale * k, scale * TALL * k, scale * BROAD * k);
    });
  }

  /** Strength of the locomotive's beam, 0..1. */
  setLights(on: number) {
    (this.beam.material as THREE.MeshBasicMaterial).opacity = 0.55 * on;
    this.beam.visible = on > 0.01;
  }

  dispose() {
    for (const d of this.disposables) d.dispose();
  }
}

/**
 * The cone of light in front of a vehicle at night, as a texture: bright at
 * the lamp, spreading and fading forward. Shared by the truck and the
 * locomotive.
 */
export function beamTexture(): THREE.Texture {
  const w = 256;
  const h = 128;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // u: 0 at the lamp (left edge), 1 at the far end; v: -1..1 across.
      const u = x / (w - 1);
      const v = (y / (h - 1)) * 2 - 1;
      const spread = 0.18 + 0.82 * u;
      const across = Math.max(0, 1 - Math.abs(v) / spread);
      const along = Math.pow(1 - u, 1.6) * Math.min(1, u * 12);
      const a = Math.pow(across, 1.4) * along;
      const i = (y * w + x) * 4;
      img.data[i] = 255;
      img.data[i + 1] = 226;
      img.data[i + 2] = 178;
      img.data[i + 3] = Math.round(a * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
