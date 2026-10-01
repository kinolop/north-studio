import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import type { Product } from "@/lib/marshrut/data";
import { PALLET, type PalletPlan } from "@/lib/marshrut/pack";
import { clamp01, easeOut, mulberry32 } from "@/lib/marshrut/util";

/**
 * A pallet of goods, drawn from the calculation that decided it.
 *
 * The cartons stand exactly where `packPallets` put them, and each carries
 * what a carton from a Chinese factory carries: kraft board, a seam of
 * branded tape, a shipping label with a barcode, the carton's number in the
 * lot. Nothing is a decoration. Look at one closely and it reads as a real
 * object; look at the rig as a whole and it is the arithmetic behind the
 * price.
 */

const INK = "#0e1218";
const PEN = "#9a6420";

export interface CartonLook {
  kraft: string;
  pine: string;
}

/** A canvas-textured material for one face of a carton. */
function faceMaterial(canvas: HTMLCanvasElement): THREE.MeshStandardMaterial {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.92, metalness: 0 });
}

function grain(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, amount: number) {
  const random = mulberry32(seed);
  const img = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (random() - 0.5) * amount;
    img.data[i] = Math.max(0, Math.min(255, (img.data[i] as number) + n));
    img.data[i + 1] = Math.max(0, Math.min(255, (img.data[i + 1] as number) + n));
    img.data[i + 2] = Math.max(0, Math.min(255, (img.data[i + 2] as number) + n * 0.9));
  }
  ctx.putImageData(img, 0, 0);
}

function barcode(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, seed: number) {
  const random = mulberry32(seed);
  ctx.fillStyle = INK;
  let cursor = x;
  while (cursor < x + w) {
    const bar = 1 + Math.floor(random() * 3);
    if (cursor + bar > x + w) break;
    ctx.fillRect(cursor, y, bar, h);
    cursor += bar + 1 + Math.floor(random() * 3);
  }
}

interface Faces {
  long: HTMLCanvasElement[];
  short: HTMLCanvasElement;
  top: HTMLCanvasElement;
  bottom: HTMLCanvasElement;
}

/**
 * Textures for the four kinds of carton face. Sized in proportion to the
 * carton so a label is the same physical size on a big carton as on a small
 * one and nothing is stretched.
 */
function drawFaces(look: CartonLook, product: Product, dims: { l: number; w: number; h: number }, total: number): Faces {
  const ppm = 700;
  const make = (wMeters: number, hMeters: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(64, Math.round(wMeters * ppm));
    canvas.height = Math.max(64, Math.round(hMeters * ppm));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.fillStyle = look.kraft;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return { canvas, ctx };
  };
  const finish = (c: { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }, seed: number) => {
    grain(c.ctx, c.canvas.width, c.canvas.height, seed, 16);
    return c.canvas;
  };

  const longFace = (flip: boolean, seed: number) => {
    const c = make(dims.l, dims.h);
    const { ctx, canvas } = c;
    const w = canvas.width;
    const h = canvas.height;
    // Seam of the flaps along the top edge, under the tape.
    ctx.fillStyle = "rgb(0 0 0 / 0.07)";
    ctx.fillRect(0, h * 0.06, w, 2);

    // Shipping label.
    const lw = Math.min(w * 0.42, 0.2 * ppm);
    const lh = Math.min(h * 0.5, 0.13 * ppm);
    const lx = flip ? w - lw - w * 0.08 : w * 0.08;
    const ly = h - lh - h * 0.14;
    ctx.fillStyle = "#f4f4f1";
    ctx.fillRect(lx, ly, lw, lh);
    ctx.strokeStyle = "rgb(14 18 24 / 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(lx + 0.5, ly + 0.5, lw - 1, lh - 1);
    ctx.fillStyle = INK;
    ctx.font = `600 ${Math.round(lh * 0.17)}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textBaseline = "top";
    ctx.fillText("MR-0417", lx + lw * 0.07, ly + lh * 0.08);
    ctx.font = `400 ${Math.round(lh * 0.115)}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.fillText(product.goods.slice(0, 22).toUpperCase(), lx + lw * 0.07, ly + lh * 0.3);
    ctx.fillText(`${product.unitsPerCarton} PCS  ${(dims.l * dims.w * dims.h * 1000).toFixed(0)} L`, lx + lw * 0.07, ly + lh * 0.44);
    barcode(ctx, lx + lw * 0.07, ly + lh * 0.6, lw * 0.86, lh * 0.28, seed);

    // Two arrows and the number in the lot, printed straight on the board.
    const ax = flip ? w * 0.1 : w * 0.72;
    ctx.fillStyle = INK;
    for (let k = 0; k < 2; k++) {
      const x = ax + k * h * 0.2;
      const y = h * 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y - h * 0.17);
      ctx.lineTo(x + h * 0.07, y - h * 0.03);
      ctx.lineTo(x + h * 0.025, y - h * 0.03);
      ctx.lineTo(x + h * 0.025, y + h * 0.12);
      ctx.lineTo(x - h * 0.025, y + h * 0.12);
      ctx.lineTo(x - h * 0.025, y - h * 0.03);
      ctx.lineTo(x - h * 0.07, y - h * 0.03);
      ctx.closePath();
      ctx.fill();
    }
    ctx.font = `700 ${Math.round(h * 0.09)}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.fillText(`1/${total}`, flip ? w * 0.56 : w * 0.08, h * 0.22);
    return finish(c, seed);
  };

  const shortFace = () => {
    const c = make(dims.w, dims.h);
    const { ctx, canvas } = c;
    // Tape running down from the top seam.
    const tw = Math.min(canvas.width * 0.16, 0.05 * ppm);
    ctx.fillStyle = "rgb(250 250 246 / 0.9)";
    ctx.fillRect(canvas.width / 2 - tw / 2, 0, tw, Math.min(canvas.height * 0.4, 0.09 * ppm));
    ctx.fillStyle = "rgb(0 0 0 / 0.07)";
    ctx.fillRect(canvas.width / 2 - 1, 0, 2, canvas.height * 0.12);
    return finish(c, 31);
  };

  const topFace = () => {
    const c = make(dims.l, dims.w);
    const { ctx, canvas } = c;
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = "rgb(0 0 0 / 0.08)";
    ctx.fillRect(0, h / 2 - 1, w, 2);
    // Branded tape along the seam.
    const th = Math.min(h * 0.16, 0.05 * ppm);
    ctx.fillStyle = "#f6f6f2";
    ctx.fillRect(0, h / 2 - th / 2, w, th);
    ctx.fillStyle = PEN;
    ctx.font = `800 ${Math.round(th * 0.62)}px "Sofia Sans Extra Condensed", "Arial Narrow", sans-serif`;
    ctx.textBaseline = "middle";
    const word = "МАРШРУТ   ";
    let x = 6;
    while (x < w) {
      ctx.fillText(word, x, h / 2 + 1);
      x += ctx.measureText(word).width + 26;
    }
    return finish(c, 47);
  };

  const bottomFace = () => {
    const c = make(dims.l, dims.w);
    return finish(c, 59);
  };

  return {
    long: [longFace(false, 11), longFace(true, 23)],
    short: shortFace(),
    top: topFace(),
    bottom: bottomFace(),
  };
}

function woodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.fillStyle = "#d8bd90";
  ctx.fillRect(0, 0, 512, 128);
  const random = mulberry32(5);
  for (let i = 0; i < 90; i++) {
    const y = random() * 128;
    ctx.strokeStyle = `rgb(120 84 40 / ${0.05 + random() * 0.12})`;
    ctx.lineWidth = 0.5 + random() * 1.4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(170, y + (random() - 0.5) * 6, 340, y + (random() - 0.5) * 6, 512, y + (random() - 0.5) * 3);
    ctx.stroke();
  }
  grain(ctx, 512, 128, 9, 10);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

/** An EUR pallet, 1200 x 800 x 144 mm, as one merged mesh. */
export function buildPallet(look: CartonLook): THREE.Group {
  const parts: THREE.BufferGeometry[] = [];
  const box = (sx: number, sy: number, sz: number, x: number, y: number, z: number) => {
    const g = new THREE.BoxGeometry(sx, sy, sz);
    g.translate(x, y, z);
    parts.push(g);
  };
  const zs = [-0.3275, 0, 0.3275];
  for (const z of zs) box(1.2, 0.022, 0.145, 0, 0.011, z);
  for (const x of [-0.5275, 0, 0.5275]) for (const z of zs) box(0.145, 0.078, 0.145, x, 0.022 + 0.039, z);
  for (const z of zs) box(1.2, 0.022, 0.145, 0, 0.111, z);
  for (let i = 0; i < 5; i++) box(1.2, 0.022, 0.145, 0, 0.133, -0.3275 + (i * 0.655) / 4);

  const geometry = mergeGeometries(parts, false);
  const material = new THREE.MeshStandardMaterial({
    map: woodTexture(),
    color: new THREE.Color(look.pine),
    roughness: 0.85,
    metalness: 0,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry, 30),
    new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.4 }),
  );
  const group = new THREE.Group();
  group.add(mesh, edges);
  return group;
}

export interface CargoDims {
  /** Footprint of the cartons on the pallet and the total stack height, metres. */
  l: number;
  w: number;
  h: number;
}

/**
 * The pallet that is shown: wood at the bottom, then the cartons that
 * `packPallets` put on it. Origin at the pallet's centre on the floor.
 */
export class CargoRig {
  readonly group = new THREE.Group();
  private pallet: THREE.Group;
  private cartons = new THREE.Group();
  private items: { mesh: THREE.Object3D; y: number; start: number }[] = [];
  private disposables: { dispose(): void }[] = [];
  dims: CargoDims = { l: PALLET.w, w: PALLET.d, h: PALLET.h };

  constructor(private look: CartonLook) {
    this.pallet = buildPallet(look);
    this.group.add(this.pallet, this.cartons);
  }

  /** Stands the cartons up for a plan and returns how tall the stack is. */
  build(plan: PalletPlan, product: Product) {
    this.clear();
    const dims = { l: plan.l, w: plan.w, h: plan.h };
    const faces = drawFaces(this.look, product, dims, Math.max(1, plan.slots.length));
    const shortMat = faceMaterial(faces.short);
    const topMat = faceMaterial(faces.top);
    const bottomMat = faceMaterial(faces.bottom);
    const longMats = faces.long.map(faceMaterial);
    this.disposables.push(shortMat, topMat, bottomMat, ...longMats);

    const geometry = new THREE.BoxGeometry(plan.l * 0.996, plan.h * 0.996, plan.w * 0.996);
    const edgeGeometry = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.55 });
    this.disposables.push(geometry, edgeGeometry, edgeMaterial);

    const n = plan.slots.length;
    plan.slots.forEach((slot, i) => {
      const long = longMats[i % 2] as THREE.Material;
      // Box face order: +x, -x, +y, -y, +z, -z.
      const materials = [shortMat, shortMat, topMat, bottomMat, long, longMats[(i + 1) % 2] as THREE.Material];
      const mesh = new THREE.Mesh(geometry, materials);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const carton = new THREE.Group();
      carton.add(mesh, new THREE.LineSegments(edgeGeometry, edgeMaterial));
      carton.position.set(slot.x, slot.y, slot.z);
      this.cartons.add(carton);
      this.items.push({ mesh: carton, y: slot.y, start: (i / Math.max(1, n)) * 0.72 });
    });

    const top = plan.slots.reduce<number>((m, s) => Math.max(m, s.y + plan.h / 2), PALLET.h);
    this.dims = {
      l: plan.nx * plan.l,
      w: plan.nz * plan.w,
      h: top,
    };
    this.drop(1);
  }

  /** 0: the pallet is bare. 1: every carton is on it. Layers arrive from below to above. */
  drop(t: number) {
    for (const item of this.items) {
      const local = clamp01((t - item.start) / 0.28);
      item.mesh.visible = local > 0;
      const e = easeOut(local);
      item.mesh.position.y = item.y + (1 - e) * 1.5;
      item.mesh.rotation.y = (1 - e) * 0.12;
      const fade = clamp01(local * 6);
      item.mesh.scale.setScalar(0.9 + 0.1 * fade);
    }
  }

  private clear() {
    for (const child of [...this.cartons.children]) this.cartons.remove(child);
    for (const d of this.disposables) d.dispose();
    this.disposables = [];
    this.items = [];
  }

  dispose() {
    this.clear();
    this.pallet.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose?.();
      const material = mesh.material as THREE.Material | undefined;
      material?.dispose?.();
    });
  }
}
