import * as THREE from "three";

import { PALLET } from "@/lib/marshrut/pack";

import { beamTexture } from "./train";

/**
 * The truck the cargo rides in.
 *
 * A standard 13.6 m curtain-sider semi, drawn as a cutaway: the trailer's
 * skin is translucent so the pallets can be seen going in, and every body is
 * edged in ink like the rest of the plate. Built at true size, in metres,
 * because the first thing the camera does is stand next to it.
 *
 * Once the cargo is under way the cutaway closes: the skin becomes a light
 * curtain-sider with the company's name on it, the cab windows light up and
 * the headlights throw a cone of light ahead, which is what makes a truck on
 * a night map read as a truck and not as a box.
 *
 * Local frame: x forward, y up, z to the right. The trailer's open rear
 * edge is at x = 0, the tractor's nose at x = 16.2. The rig's own origin is
 * on the ground at the trailer's rear.
 */

/** Outlines are drawn light: at night the truck is picked out by its edges, like a lit drawing. */
const INK = "#cfc8b8";
const PEN = "#dda04a";
const LETTER = "#24262a";

export const TRAILER = { l: 13.6, w: 2.55, floor: 1.15, h: 2.85 } as const;
export const TRUCK_LENGTH = 16.3;
/** Pallets stand 1.2 m along the trailer and 0.8 m across it: 11 rows of 3. */
export const ROWS = 11;
export const COLS = 3;
export const CAPACITY = ROWS * COLS;

const paint = () => new THREE.MeshStandardMaterial({ color: "#f7f8f6", roughness: 0.5, metalness: 0.05 });
const dark = () => new THREE.MeshStandardMaterial({ color: "#1b2027", roughness: 0.7, metalness: 0.2 });
const blue = () => new THREE.MeshStandardMaterial({ color: PEN, roughness: 0.55, metalness: 0.05 });

/** The mesh plus an ink outline that sits exactly where the mesh does. */
function edged(mesh: THREE.Mesh, opacity = 0.5): THREE.Group {
  const g = new THREE.Group();
  const lines = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry, 28),
    new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity }),
  );
  lines.position.copy(mesh.position);
  lines.quaternion.copy(mesh.quaternion);
  lines.scale.copy(mesh.scale);
  g.add(mesh, lines);
  return g;
}

function livery(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.clearRect(0, 0, 2048, 256);
  ctx.fillStyle = LETTER;
  ctx.font = `800 236px "Sofia Sans Extra Condensed", "Arial Narrow", sans-serif`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("МАРШРУТ", 24, 214);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export class TruckRig {
  readonly group = new THREE.Group();
  private load: THREE.InstancedMesh;
  private loadEdges: THREE.LineSegments;
  private loadMat: THREE.MeshStandardMaterial;
  private wheels: THREE.Mesh[] = [];
  private disposables: { dispose(): void }[] = [];
  private skin: THREE.MeshStandardMaterial;
  private glassLit: THREE.MeshStandardMaterial;
  private beam: THREE.Mesh;
  private lamps: THREE.Mesh[] = [];

  constructor(kraft: string) {
    const g = this.group;
    const add = (o: THREE.Object3D) => {
      g.add(o);
      return o;
    };

    // Trailer: floor, chassis beams, translucent skin, edged frame.
    const floor = new THREE.Mesh(new THREE.BoxGeometry(TRAILER.l, 0.07, TRAILER.w - 0.1), new THREE.MeshStandardMaterial({ color: "#3d3833", roughness: 0.92 }));
    floor.position.set(TRAILER.l / 2, TRAILER.floor + 0.035, 0);
    floor.receiveShadow = true;
    add(edged(floor, 0.35));

    for (const z of [-0.78, 0.78]) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(TRAILER.l - 0.5, 0.26, 0.16), dark());
      beam.position.set(TRAILER.l / 2, TRAILER.floor - 0.16, z);
      beam.castShadow = true;
      add(beam);
    }

    const skin = new THREE.MeshStandardMaterial({
      color: "#d6d1c7",
      transparent: true,
      opacity: 0.07,
      roughness: 0.55,
      metalness: 0.05,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.skin = skin;
    const top = TRAILER.floor + TRAILER.h;
    const wall = (sx: number, sy: number, x: number, y: number, z: number, ry: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(sx, sy), skin);
      m.position.set(x, y, z);
      m.rotation.y = ry;
      m.renderOrder = 2;
      add(m);
    };
    wall(TRAILER.l, TRAILER.h, TRAILER.l / 2, TRAILER.floor + TRAILER.h / 2, TRAILER.w / 2, 0);
    wall(TRAILER.l, TRAILER.h, TRAILER.l / 2, TRAILER.floor + TRAILER.h / 2, -TRAILER.w / 2, 0);
    wall(TRAILER.w, TRAILER.h, TRAILER.l, TRAILER.floor + TRAILER.h / 2, 0, Math.PI / 2);
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(TRAILER.l, TRAILER.w), skin);
    roof.rotation.x = -Math.PI / 2;
    roof.position.set(TRAILER.l / 2, top, 0);
    roof.renderOrder = 2;
    add(roof);

    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(TRAILER.l, TRAILER.h, TRAILER.w)),
      new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.6 }),
    );
    frame.position.set(TRAILER.l / 2, TRAILER.floor + TRAILER.h / 2, 0);
    add(frame);

    // Livery: a blue band and the name, on both sides.
    const tex = livery();
    this.disposables.push(tex);
    for (const s of [1, -1]) {
      const band = new THREE.Mesh(new THREE.PlaneGeometry(TRAILER.l, 0.3), blue());
      band.position.set(TRAILER.l / 2, TRAILER.floor + 0.3, (s * TRAILER.w) / 2 + s * 0.004);
      band.rotation.y = s > 0 ? 0 : Math.PI;
      add(band);
      const name = new THREE.Mesh(
        new THREE.PlaneGeometry(6.8, 0.85),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
      );
      name.position.set(TRAILER.l / 2 + 0.6, TRAILER.floor + 1.55, (s * TRAILER.w) / 2 + s * 0.006);
      name.rotation.y = s > 0 ? 0 : Math.PI;
      name.renderOrder = 3;
      add(name);
    }

    // Tractor.
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.35, 2.45, 2.5), paint());
    cab.position.set(15.0, 0.95 + 1.225, 0);
    cab.castShadow = true;
    add(edged(cab));
    this.glassLit = new THREE.MeshStandardMaterial({
      color: "#2a2620",
      roughness: 0.2,
      metalness: 0.3,
      emissive: "#f0c48a",
      emissiveIntensity: 0,
    });
    const wind = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.2, 2.3), this.glassLit);
    wind.position.set(16.2, 2.85, 0);
    add(wind);
    for (const z of [-1.253, 1.253]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.95, 0.02), this.glassLit);
      side.position.set(15.5, 2.95, z);
      add(side);
    }
    // Headlights, and the cone they throw on the road ahead.
    for (const z of [-0.9, 0.9]) {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.42), new THREE.MeshBasicMaterial({ color: "#fff4dc" }));
      lamp.position.set(16.37, 1.0, z);
      lamp.visible = false;
      add(lamp);
      this.lamps.push(lamp);
    }
    const beamTex = beamTexture();
    this.disposables.push(beamTex);
    this.beam = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        map: beamTex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0,
      }),
    );
    this.beam.scale.set(46, 1, 13);
    this.beam.position.set(16.4 + 23, 0.06, 0);
    this.beam.visible = false;
    add(this.beam);
    const deflector = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.7, 2.4), paint());
    deflector.position.set(14.55, 3.85, 0);
    deflector.castShadow = true;
    add(edged(deflector, 0.45));
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 2.5), dark());
    bumper.position.set(16.2, 0.72, 0);
    bumper.castShadow = true;
    add(bumper);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.36, 0.3, 2.51), blue());
    stripe.position.set(15.0, 1.3, 0);
    add(stripe);
    const frameRail = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.3, 1.1), dark());
    frameRail.position.set(13.7, 0.95, 0);
    frameRail.castShadow = true;
    add(frameRail);

    // Wheels.
    const wheelGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.32, 24);
    wheelGeo.rotateX(Math.PI / 2);
    const hubGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.34, 16);
    hubGeo.rotateX(Math.PI / 2);
    const tire = new THREE.MeshStandardMaterial({ color: "#161a1f", roughness: 0.9 });
    const hub = new THREE.MeshStandardMaterial({ color: "#9aa0a8", roughness: 0.4, metalness: 0.6 });
    this.disposables.push(wheelGeo, hubGeo, tire, hub);
    const axles: [number, number][] = [
      [2.0, 1.1],
      [3.3, 1.1],
      [4.6, 1.1],
      [12.3, 1.1],
      [15.4, 1.1],
    ];
    for (const [x] of axles) {
      for (const z of [-1.1, 1.1]) {
        const w = new THREE.Mesh(wheelGeo, tire);
        w.position.set(x, 0.52, z);
        w.castShadow = true;
        const h = new THREE.Mesh(hubGeo, hub);
        h.position.set(x, 0.52, z + Math.sign(z) * 0.02);
        add(w);
        add(h);
        this.wheels.push(w);
      }
    }

    // Everything already in the trailer, as one instanced mesh of pallet stacks.
    this.loadMat = new THREE.MeshStandardMaterial({ color: kraft, roughness: 0.92 });
    this.load = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), this.loadMat, CAPACITY);
    this.load.castShadow = true;
    this.load.frustumCulled = false;
    this.load.count = 0;
    add(this.load);
    this.loadEdges = new THREE.LineSegments(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.5 }),
    );
    this.loadEdges.frustumCulled = false;
    add(this.loadEdges);
  }

  /** 0: the cutaway used while loading. 1: the closed curtain-sider of a truck on the road. */
  setClosed(t: number) {
    const k = Math.min(1, Math.max(0, t));
    this.skin.opacity = 0.07 + 0.93 * k;
    const solid = k > 0.995;
    if (this.skin.transparent === solid) {
      this.skin.transparent = !solid;
      this.skin.depthWrite = solid;
      this.skin.needsUpdate = true;
    }
  }

  /** Cab light and headlights, 0..1. */
  setLights(on: number) {
    const k = Math.min(1, Math.max(0, on));
    this.glassLit.emissiveIntensity = 0.9 * k;
    (this.beam.material as THREE.MeshBasicMaterial).opacity = 0.6 * k;
    this.beam.visible = k > 0.01;
    for (const lamp of this.lamps) lamp.visible = k > 0.01;
  }

  /** Where the k-th pallet stands, counted from the front of the trailer, at floor level. */
  slot(k: number): THREE.Vector3 {
    const row = Math.floor(k / COLS);
    const col = k % COLS;
    return new THREE.Vector3(
      TRAILER.l - 0.12 - PALLET.w / 2 - row * (PALLET.w + 0.004),
      TRAILER.floor + 0.07,
      (col - 1) * (PALLET.d + 0.02),
    );
  }

  /**
   * Fills the trailer with `count` pallets standing `height` metres tall,
   * leaving out the last one: that is the pallet that is still being
   * loaded, and it is drawn separately so it can be seen going in.
   */
  setLoad(count: number, height: number, exceptLast: boolean) {
    const n = Math.min(CAPACITY, Math.max(0, count - (exceptLast ? 1 : 0)));
    const m = new THREE.Matrix4();
    const positions: number[] = [];
    const corner = (x: number, y: number, z: number) => positions.push(x, y, z);
    for (let k = 0; k < n; k++) {
      const s = this.slot(k);
      const sx = PALLET.w * 0.985;
      const sz = PALLET.d * 0.985;
      const sy = Math.max(0.2, height - PALLET.h);
      m.compose(
        new THREE.Vector3(s.x, s.y + PALLET.h + sy / 2, s.z),
        new THREE.Quaternion(),
        new THREE.Vector3(sx, sy, sz),
      );
      this.load.setMatrixAt(k, m);
      const x0 = s.x - sx / 2;
      const x1 = s.x + sx / 2;
      const z0 = s.z - sz / 2;
      const z1 = s.z + sz / 2;
      const y0 = s.y + PALLET.h;
      const y1 = y0 + sy;
      // Twelve edges of the box.
      for (const y of [y0, y1]) {
        corner(x0, y, z0); corner(x1, y, z0);
        corner(x1, y, z0); corner(x1, y, z1);
        corner(x1, y, z1); corner(x0, y, z1);
        corner(x0, y, z1); corner(x0, y, z0);
      }
      for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]] as const) {
        corner(x, y0, z); corner(x, y1, z);
      }
    }
    this.load.count = n;
    this.load.instanceMatrix.needsUpdate = true;
    this.loadEdges.geometry.dispose();
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    this.loadEdges.geometry = geometry;
  }

  dispose() {
    this.group.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose?.();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) material.forEach((mm) => mm.dispose());
      else material?.dispose?.();
    });
    for (const d of this.disposables) d.dispose();
  }
}
