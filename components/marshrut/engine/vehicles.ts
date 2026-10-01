import * as THREE from "three";

import type { ModeId } from "@/lib/marshrut/data";

import { TRUCK_LENGTH } from "./truck";

/**
 * What carries the cargo when it is not a truck: a container ship with its
 * wake, an aircraft with its contrails. (The train is a consist of its own,
 * see train.ts, because it has to bend round the line.)
 *
 * Built at true proportions out of a few solids, without outlines, painted
 * in the muted colours of real hulls and liveries, so at map scale they read
 * as a ship and a plane seen from very high up rather than as toys. Each is
 * authored to span about 16.3 units, the truck's length, and the engine
 * scales them with the camera in the same way.
 *
 * Local frame: x forward, y up, centred on x = 0, standing on y = 0.
 */

const mat = (color: string, rough = 0.6, metal = 0.1) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });

const box = (sx: number, sy: number, sz: number) => new THREE.BoxGeometry(sx, sy, sz);

function put(group: THREE.Group, geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}

/** A soft additive trail: the wake behind a ship, the contrail behind a plane. */
function trailTexture(kind: "wake" | "contrail"): THREE.Texture {
  const w = 256;
  const h = 64;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // u: 1 at the vehicle (right edge), 0 far behind; v: -1..1 across.
      const u = x / (w - 1);
      const v = (y / (h - 1)) * 2 - 1;
      let a: number;
      if (kind === "wake") {
        // Two arms opening out behind the stern, and the churned centre.
        const spread = 0.12 + 0.88 * (1 - u);
        const arm = Math.exp(-Math.pow((Math.abs(v) - spread * 0.9) / 0.09, 2));
        const centre = Math.exp(-Math.pow(v / (0.06 + 0.2 * (1 - u)), 2)) * 0.7;
        a = Math.max(arm, centre) * Math.pow(u, 1.3);
      } else {
        const width = 0.25 + 0.5 * (1 - u);
        a = Math.exp(-Math.pow(v / width, 2)) * Math.pow(u, 1.8);
      }
      const i = (y * w + x) * 4;
      img.data[i] = 236;
      img.data[i + 1] = 233;
      img.data[i + 2] = 226;
      img.data[i + 3] = Math.round(Math.min(1, a) * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function trail(kind: "wake" | "contrail", length: number, width: number, opacity: number) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      map: trailTexture(kind),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity,
    }),
  );
  mesh.scale.set(length, 1, width);
  return mesh;
}

function ship(): THREE.Group {
  const g = new THREE.Group();
  const hull = mat("#26282c", 0.7, 0.3);
  const boot = mat("#5a2a24", 0.8, 0.1);
  const deck = mat("#3a3c40", 0.8, 0.2);
  const white = mat("#d9d5cc", 0.6, 0.05);
  const colours = ["#7a3b2c", "#3c4a3f", "#59616b", "#8a6a3b", "#45556b", "#2a2c30", "#6b2f2a"].map((c) => mat(c, 0.7, 0.2));

  // Hull: a long box with a pointed bow, and the red of the waterline below.
  const shape = new THREE.Shape();
  shape.moveTo(-8.0, -1.2);
  shape.lineTo(5.4, -1.2);
  shape.quadraticCurveTo(8.15, -0.6, 8.15, 0);
  shape.quadraticCurveTo(8.15, 0.6, 5.4, 1.2);
  shape.lineTo(-8.0, 1.2);
  shape.closePath();
  const hullGeo = new THREE.ExtrudeGeometry(shape, { depth: 1.3, bevelEnabled: false });
  hullGeo.rotateX(-Math.PI / 2);
  const upper = put(g, hullGeo, hull, 0, 0.35, 0);
  upper.scale.y = 1;
  const lowerGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.35, bevelEnabled: false });
  lowerGeo.rotateX(-Math.PI / 2);
  put(g, lowerGeo, boot, 0, 0, 0);
  put(g, box(15.4, 0.05, 2.3), deck, -0.3, 1.66, 0);

  // Containers, three tiers, nine bays, three rows.
  let n = 0;
  for (let ix = 0; ix < 9; ix++) {
    for (let iz = -1; iz <= 1; iz++) {
      const tiers = ix === 0 || ix === 8 ? 2 : 3;
      for (let iy = 0; iy < tiers; iy++) {
        const c = colours[(n * 5 + ix * 3 + iy) % colours.length]!;
        n++;
        put(g, box(1.3, 0.6, 0.7), c, -5.0 + ix * 1.36, 2.0 + iy * 0.62, iz * 0.74);
      }
    }
  }
  // Bridge at the stern.
  put(g, box(1.6, 2.2, 2.2), white, -6.9, 2.8, 0);
  put(g, box(0.06, 0.35, 2.0), new THREE.MeshStandardMaterial({ color: "#2a2620", emissive: "#f0c48a", emissiveIntensity: 0.8 }), -6.08, 3.5, 0);
  put(g, box(0.6, 1.0, 0.6), mat("#2a2c30"), -7.3, 4.3, 0);

  const wake = trail("wake", 40, 9, 0.5);
  wake.position.set(-8.0 - 20, 0.05, 0);
  g.add(wake);
  return g;
}

function plane(): THREE.Group {
  const g = new THREE.Group();
  const white = mat("#e4e1da", 0.45, 0.15);
  const grey = mat("#8b8e93", 0.5, 0.3);
  const dark = mat("#2a2c30", 0.6, 0.3);

  const fuselage = new THREE.CapsuleGeometry(0.85, 13.4, 6, 18);
  fuselage.rotateZ(Math.PI / 2);
  put(g, fuselage, white, 0, 1.6, 0);
  put(g, box(0.1, 0.42, 1.0), dark, 7.35, 1.85, 0);
  put(g, box(13.4, 0.12, 0.1), mat("#dc9f4b", 0.5, 0.1), 0, 1.4, 0.86);
  put(g, box(13.4, 0.12, 0.1), mat("#dc9f4b", 0.5, 0.1), 0, 1.4, -0.86);

  for (const s of [1, -1]) {
    const wing = put(g, box(2.8, 0.14, 7.6), white, 0.3, 1.32, s * 4.4);
    wing.rotation.y = s * -0.55;
    const tail = put(g, box(1.6, 0.1, 2.8), white, -6.5, 1.95, s * 1.6);
    tail.rotation.y = s * -0.5;
    const engine = new THREE.CylinderGeometry(0.4, 0.36, 1.8, 16);
    engine.rotateZ(Math.PI / 2);
    put(g, engine, grey, 1.2, 0.85, s * 3.3);
  }
  put(g, box(2.2, 2.4, 0.12), white, -6.6, 3.2, 0);

  // Contrails from the two engines, drawn just under the aircraft.
  for (const s of [1, -1]) {
    const c = trail("contrail", 60, 1.6, 0.45);
    c.position.set(-30 + 0.4, 0.9, s * 3.3);
    g.add(c);
  }
  return g;
}

const cache = new Map<ModeId, THREE.Group>();

/** A vehicle of the mode's own kind, scaled to the truck's nominal length. The train is not one: see TrainConsist. */
export function buildToken(mode: ModeId): THREE.Group {
  const cached = cache.get(mode);
  if (cached) return cached;
  const model = mode === "sea" ? ship() : mode === "air" ? plane() : new THREE.Group();
  const wrap = new THREE.Group();
  wrap.add(model);
  wrap.scale.setScalar(TRUCK_LENGTH / 16.3);
  wrap.traverse((o) => {
    (o as THREE.Mesh).castShadow = false;
  });
  cache.set(mode, wrap);
  return wrap;
}
