import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import { glazeById, type Glaze, type GlazeId } from "@/lib/krug/data";
import { outerWall, WALL, FLOOR, type Point, type Profile } from "@/lib/krug/profile";

/**
 * One pot on one wheel, drawn in WebGL.
 *
 * The geometry is turned here rather than with three's LatheGeometry,
 * because a thrown pot is not a perfect solid of revolution. The finger
 * ridges of each pull run round the wall, the rim is never quite level and
 * the whole thing leans a fraction off true; those three small faults are
 * what make it read as made by hand, and they are also what lets the eye
 * see it turning at all, since a perfect solid of revolution looks still on
 * a spinning wheel.
 *
 * The stage is one continuous number from 0 (wet on the wheel) to 4 (out of
 * the glaze firing). Colour, ridge depth, gloss and the wheel's presence
 * are all read off it, so stepping through the process is a crossfade of
 * one object rather than a swap between five.
 */

type Kind = 0 | 1 | 2 | 3 | 4; // base, outer, rim, inner, floor

interface Section {
  readonly pts: Point[];
  readonly kind: Kind[];
  /** Height of the rim, for "how near the top" questions. */
  readonly top: number;
}

const SEGMENTS = 120;
const SAMPLES = 120;

/** The section of the pot, kind-tagged, before any handmade faults. */
function turned(p: Profile): Section {
  const outer = outerWall(p, SAMPLES);
  const inner: Point[] = [];
  for (let i = 0; i < outer.length; i += 1) {
    const a = outer[Math.max(0, i - 1)]!;
    const b = outer[Math.min(outer.length - 1, i + 1)]!;
    const dr = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dr, dy) || 1;
    inner.push([Math.max(0.15, outer[i]![0] - (dy / len) * WALL), outer[i]![1] + (dr / len) * WALL]);
  }
  const innerAbove = inner.filter(([, y]) => y >= FLOOR);
  const top = outer[outer.length - 1]!;
  const topIn = innerAbove[innerAbove.length - 1] ?? [top[0] - WALL, top[1]];

  const pts: Point[] = [];
  const kind: Kind[] = [];
  const push = (pt: Point, k: Kind) => {
    pts.push(pt);
    kind.push(k);
  };

  // The underside, from the axis out to the foot ring, with a slight hollow
  // where the foot was trimmed.
  for (let k = 0; k <= 6; k += 1) {
    const t = k / 6;
    const r = t * (p.foot - 0.35);
    push([Math.max(0.001, r), 0.18 * Math.sin(Math.PI * Math.min(1, t * 1.1)) * (1 - t)], 0);
  }
  push([p.foot - 0.12, 0.02], 0);
  for (const pt of outer) push(pt, 1);

  const cr = (top[0] + topIn[0]) / 2;
  const cy = (top[1] + topIn[1]) / 2;
  const rr = Math.hypot(top[0] - topIn[0], top[1] - topIn[1]) / 2;
  const a0 = Math.atan2(top[1] - cy, top[0] - cr);
  for (let k = 1; k < 10; k += 1) {
    const a = a0 + (Math.PI * k) / 10;
    push([cr + Math.cos(a) * rr, cy + Math.sin(a) * rr], 2);
  }

  for (let i = innerAbove.length - 1; i >= 0; i -= 1) push(innerAbove[i]!, 3);
  const edge = innerAbove[0] ?? [p.foot - WALL, FLOOR];
  // The inside floor, rounding into the wall.
  for (let k = 1; k <= 8; k += 1) {
    const t = k / 8;
    const r = edge[0] * (1 - t);
    push([Math.max(0.001, r), FLOOR + (1 - t) * Math.max(0, edge[1] - FLOOR) * 0.4 + 0.05 * Math.sin(Math.PI * t)], 4);
  }
  return { pts, kind, top: top[1] };
}

/**
 * A rough, stable unevenness around the pot. Only whole harmonics of the
 * angle, so it closes on itself where the turn starts and ends.
 */
function wobble(th: number, seed: number): number {
  return Math.sin(th + seed) * 0.5 + Math.sin(th * 2 + seed * 1.7) * 0.3 + Math.sin(th * 5 + seed * 0.3) * 0.2;
}

/** Depth of the throwing ridge at height y: +1 on the crest, -1 in the groove. */
function ridge(y: number): number {
  const pull = Math.sin((y + 0.22 * Math.sin(y * 0.7)) * ((2 * Math.PI) / 1.1));
  // Some pulls press harder than others.
  return pull * (0.55 + 0.45 * Math.abs(Math.sin(y * 0.43 + 1.1)));
}

const C = (hex: string) => new THREE.Color(hex);

/** The clay at each step before glaze. Colours are sRGB hex, converted once. */
const CLAY = {
  throw: { base: C("#77706a"), groove: C("#655e57"), inside: C("#6a635c") },
  dry: { base: C("#b3ada3"), groove: C("#a9a399"), inside: C("#aaa49a") },
  bisque: { base: C("#c9b6a4"), groove: C("#bfab98"), inside: C("#c2ae9b") },
  fired: { base: C("#b8a48c"), groove: C("#a8937b"), inside: C("#b19d85") },
  chalk: C("#ebe7df"),
};

interface Look {
  /** sRGB-linear colour per section point. */
  readonly colour: Float32Array;
  readonly ridge: number;
  readonly roughness: number;
  readonly clearcoat: number;
  readonly wheel: number;
}

const tmp = new THREE.Color();
const tmp2 = new THREE.Color();

/** What the pot looks like at an integer stage, point by point along its section. */
function look(stage: number, sec: Section, glaze: Glaze): Look {
  const n = sec.pts.length;
  const colour = new Float32Array(n * 3);
  const g = { pool: C(glaze.pool), base: C(glaze.base), thin: C(glaze.thin) };

  for (let j = 0; j < n; j += 1) {
    const [, y] = sec.pts[j]!;
    const k = sec.kind[j]!;
    const rv = k === 1 || k === 3 ? ridge(y) : 0;
    const groove = Math.max(0, -rv);
    const nearRim = THREE.MathUtils.smoothstep(y, sec.top - 0.9, sec.top);
    const foot = k === 0 || (k === 1 && y < 0.6);

    if (stage <= 2) {
      const set = stage === 0 ? CLAY.throw : stage === 1 ? CLAY.dry : CLAY.bisque;
      tmp.copy(k >= 3 ? set.inside : set.base).lerp(set.groove, groove * 0.45);
      if (stage === 0 && k === 2) tmp.multiplyScalar(0.92);
    } else if (stage === 3) {
      // Raw glaze: chalky, pale, the colour only hinted at. The foot is waxed and stays bisque.
      if (foot) tmp.copy(CLAY.bisque.base);
      else tmp.copy(g.base).lerp(CLAY.chalk, 0.62).lerp(CLAY.chalk, groove * 0.1);
    } else {
      if (foot) {
        tmp.copy(CLAY.fired.base).lerp(CLAY.fired.groove, groove);
      } else {
        // Glass pools in the grooves and on the floor, and breaks thin on
        // the ridges and over the rim.
        const crest = Math.max(0, rv);
        tmp.copy(g.base).lerp(g.pool, Math.min(1, groove * 0.32 + (k === 4 ? 0.55 : 0) + (k === 3 ? 0.12 : 0)));
        tmp2.copy(g.thin);
        tmp.lerp(tmp2, Math.min(1, crest * 0.12 + nearRim * 0.7 + (k === 2 ? 0.25 : 0)));
        // A line where the glaze stopped, just above the waxed foot.
        if (k === 1 && y < 0.85) tmp.lerp(g.pool, 0.6);
      }
    }
    colour[j * 3] = tmp.r;
    colour[j * 3 + 1] = tmp.g;
    colour[j * 3 + 2] = tmp.b;
  }

  const table = [
    { ridge: 0.014, roughness: 0.6, clearcoat: 0.2, wheel: 1 },
    { ridge: 0.01, roughness: 0.95, clearcoat: 0, wheel: 0 },
    { ridge: 0.01, roughness: 0.9, clearcoat: 0, wheel: 0 },
    { ridge: 0.008, roughness: 1, clearcoat: 0, wheel: 0 },
    { ridge: 0.007, roughness: 1 - glaze.gloss * 0.8, clearcoat: glaze.gloss * 0.8, wheel: 0 },
  ][stage]!;
  return { colour, ...table };
}

export interface EngineOptions {
  /** Keep the wheel head under the pot at every stage, not just while throwing. */
  readonly wheelAlways?: boolean;
  /** How many pot-heights of view the frame holds. */
  readonly air?: number;
  /** Where the pot stands across the canvas, 0.5 = centred. */
  readonly anchorX?: number;
}

export class VesselEngine {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(15, 1, 1, 600);
  private turntable = new THREE.Group();
  private pot: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>;
  private wheel: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial[]>;
  private shadow: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>;
  private pmrem: THREE.PMREMGenerator;
  private raf = 0;
  private running = false;
  private last = 0;
  private angle = 0;

  private profile: Profile;
  private glaze: Glaze;
  private section: Section;
  /** Displayed stage, eased towards the target. */
  private stage: number;
  private target: number;
  private looks = new Map<number, Look>();
  private builtFor = { stage: -1, profile: null as Profile | null };
  private frameH = 12;
  private frameY = 6;
  private width = 1;
  private height = 1;

  /** Called after each rendered frame; the hero uses it to keep the handles on the wall. */
  onFrame: (() => void) | null = null;
  /** Turns per second while on the wheel. Zero for reduced motion. */
  spin = 0.32;

  constructor(
    private canvas: HTMLCanvasElement,
    profile: Profile,
    glaze: GlazeId,
    stage = 0,
    private options: EngineOptions = {},
  ) {
    this.profile = profile;
    this.glaze = glazeById(glaze);
    this.section = turned(profile);
    this.stage = stage;
    this.target = stage;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.45;

    // A window to the left and above, as in a studio with its wheels along the glass.
    const key = new THREE.DirectionalLight(0xfff6ea, 1.7);
    key.position.set(-30, 40, 24);
    this.scene.add(key);
    const fill = new THREE.HemisphereLight(0xe9eef2, 0x8a8178, 0.55);
    this.scene.add(fill);

    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.5,
      clearcoat: 0.4,
      clearcoatRoughness: 0.28,
      side: THREE.FrontSide,
    });
    this.pot = new THREE.Mesh(geometry, material);
    this.turntable.add(this.pot);

    this.wheel = this.makeWheel();
    this.turntable.add(this.wheel);
    this.shadow = this.makeShadow();
    this.scene.add(this.shadow);
    this.scene.add(this.turntable);

    this.rebuild();
    this.resize();
  }

  private makeWheel() {
    // The wheel head: cast aluminium, worn in rings, with a smear of slip so
    // that its turning can be seen.
    const size = 512;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d")!;
    g.fillStyle = "#86857f";
    g.fillRect(0, 0, size, size);
    for (let i = 0; i < 140; i += 1) {
      const r = (i / 140) * size * 0.5;
      g.strokeStyle = `rgba(${i % 3 ? 255 : 30},${i % 3 ? 255 : 30},${i % 3 ? 250 : 28},${0.03 + Math.random() * 0.05})`;
      g.lineWidth = 1 + Math.random() * 1.5;
      g.beginPath();
      g.arc(size / 2, size / 2, r, 0, Math.PI * 2);
      g.stroke();
    }
    // Slip: a pale arc of dried clay, then a few finger drags.
    g.strokeStyle = "rgba(196,188,176,0.55)";
    g.lineCap = "round";
    g.lineWidth = 18;
    g.beginPath();
    g.arc(size / 2, size / 2, size * 0.36, 0.3, 1.5);
    g.stroke();
    g.lineWidth = 7;
    g.strokeStyle = "rgba(196,188,176,0.4)";
    g.beginPath();
    g.arc(size / 2, size / 2, size * 0.43, 2.4, 3.1);
    g.stroke();
    g.beginPath();
    g.arc(size / 2, size / 2, size * 0.3, 4.2, 4.6);
    g.stroke();
    const top = new THREE.CanvasTexture(c);
    top.colorSpace = THREE.SRGBColorSpace;
    top.anisotropy = 4;

    const side = new THREE.MeshStandardMaterial({ color: 0x7a7974, metalness: 0.5, roughness: 0.5, transparent: true });
    const face = new THREE.MeshStandardMaterial({ map: top, metalness: 0.35, roughness: 0.55, transparent: true });
    const geo = new THREE.CylinderGeometry(10.5, 10.5, 1.4, 96, 1, false);
    const mesh = new THREE.Mesh(geo, [side, face, side]);
    mesh.position.y = -0.7;
    return mesh;
  }

  private makeShadow() {
    const size = 256;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(20,18,16,0.55)");
    grad.addColorStop(0.45, "rgba(20,18,16,0.32)");
    grad.addColorStop(1, "rgba(20,18,16,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    const mesh = new THREE.Mesh(
      new THREE.CircleGeometry(1, 48),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.02;
    return mesh;
  }

  setProfile(p: Profile) {
    if (p === this.profile) return;
    this.profile = p;
    this.section = turned(p);
    this.looks.clear();
    this.rebuild();
  }

  setGlaze(id: GlazeId) {
    const next = glazeById(id);
    if (next === this.glaze) return;
    this.glaze = next;
    this.looks.clear();
    this.rebuild();
  }

  setStage(s: number, immediate = false) {
    this.target = s;
    if (immediate) {
      this.stage = s;
      this.rebuild();
      this.draw();
    }
    this.kick();
  }

  private lookAt(stage: number): Look {
    let l = this.looks.get(stage);
    if (!l) {
      l = look(stage, this.section, this.glaze);
      this.looks.set(stage, l);
    }
    return l;
  }

  /** Turn the section into a mesh for the current displayed stage. */
  private rebuild() {
    const sec = this.section;
    const s = this.stage;
    const lo = Math.floor(s);
    const hi = Math.min(4, lo + 1);
    const f = s - lo;
    const A = this.lookAt(lo);
    const B = this.lookAt(hi);
    const ridgeAmp = A.ridge + (B.ridge - A.ridge) * f;

    const n = sec.pts.length;
    // Section with ridges pressed in along the wall's own normal.
    const pr = new Float32Array(n);
    const py = new Float32Array(n);
    for (let j = 0; j < n; j += 1) {
      const [r, y] = sec.pts[j]!;
      const k = sec.kind[j]!;
      let dr = 0;
      if (k === 1 || k === 3) {
        // Ridges fade out at the very foot and just under the rim.
        const fade = THREE.MathUtils.smoothstep(y, 0.3, 1.2) * (1 - THREE.MathUtils.smoothstep(y, sec.top - 0.6, sec.top));
        dr = ridge(y) * ridgeAmp * fade * (k === 1 ? 1 : 0.6);
      }
      pr[j] = r + dr;
      py[j] = y;
    }
    // 2D normals of the pressed section, outward of the solid.
    const nr = new Float32Array(n);
    const ny = new Float32Array(n);
    for (let j = 0; j < n; j += 1) {
      const a = Math.max(0, j - 1);
      const b = Math.min(n - 1, j + 1);
      const tr = pr[b]! - pr[a]!;
      const ty = py[b]! - py[a]!;
      const len = Math.hypot(tr, ty) || 1;
      nr[j] = ty / len;
      ny[j] = -tr / len;
    }

    const cols = SEGMENTS + 1;
    const count = n * cols;
    const pos = new Float32Array(count * 3);
    const nor = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const top = sec.top;

    for (let i = 0; i < cols; i += 1) {
      const th = (i / SEGMENTS) * Math.PI * 2;
      const sin = Math.sin(th);
      const cos = Math.cos(th);
      // The handmade faults: a slight lean, an uneven rim, walls a touch out of round.
      const round = 1 + 0.012 * wobble(th * 2, 1.3);
      const rimLift = 0.07 * wobble(th * 3, 4.1) + 0.03 * Math.sin(th * 2 + 0.6);
      const mottle = 1 + 0.035 * wobble(th * 7, 2.2);
      for (let j = 0; j < n; j += 1) {
        const v = i * n + j;
        const y = py[j]!;
        const up = THREE.MathUtils.smoothstep(y, top * 0.55, top);
        const k = sec.kind[j]!;
        const r = pr[j]! * (k === 0 ? 1 : round);
        const lean = 0.05 * (y / Math.max(1, top));
        const wall = k === 1 || k === 2 || k === 3;
        pos[v * 3] = r * sin + (k === 0 ? 0 : lean);
        pos[v * 3 + 1] = wall ? y + rimLift * up : y;
        pos[v * 3 + 2] = r * cos;
        nor[v * 3] = nr[j]! * sin;
        nor[v * 3 + 1] = ny[j]!;
        nor[v * 3 + 2] = nr[j]! * cos;
        const m = sec.kind[j] === 4 ? 1 : mottle;
        col[v * 3] = (A.colour[j * 3]! + (B.colour[j * 3]! - A.colour[j * 3]!) * f) * m;
        col[v * 3 + 1] = (A.colour[j * 3 + 1]! + (B.colour[j * 3 + 1]! - A.colour[j * 3 + 1]!) * f) * m;
        col[v * 3 + 2] = (A.colour[j * 3 + 2]! + (B.colour[j * 3 + 2]! - A.colour[j * 3 + 2]!) * f) * m;
      }
    }

    const geo = this.pot.geometry;
    const reuse = geo.getAttribute("position")?.count === count;
    if (reuse) {
      (geo.getAttribute("position") as THREE.BufferAttribute).set(pos);
      (geo.getAttribute("normal") as THREE.BufferAttribute).set(nor);
      (geo.getAttribute("color") as THREE.BufferAttribute).set(col);
      geo.getAttribute("position").needsUpdate = true;
      geo.getAttribute("normal").needsUpdate = true;
      geo.getAttribute("color").needsUpdate = true;
    } else {
      const index: number[] = [];
      for (let i = 0; i < SEGMENTS; i += 1) {
        for (let j = 0; j < n - 1; j += 1) {
          const a = i * n + j;
          const b = a + 1;
          const d = (i + 1) * n + j;
          const c = d + 1;
          index.push(a, d, b, b, d, c);
        }
      }
      const next = new THREE.BufferGeometry();
      next.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      next.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
      next.setAttribute("color", new THREE.BufferAttribute(col, 3));
      next.setIndex(index);
      this.pot.geometry.dispose();
      this.pot.geometry = next;
    }
    this.pot.geometry.computeBoundingSphere();

    const mat = this.pot.material;
    mat.roughness = A.roughness + (B.roughness - A.roughness) * f;
    mat.clearcoat = A.clearcoat + (B.clearcoat - A.clearcoat) * f;

    const wheel = this.options.wheelAlways ? 1 : A.wheel + (B.wheel - A.wheel) * f;
    for (const m of this.wheel.material) {
      m.opacity = wheel;
    }
    this.wheel.visible = wheel > 0.01;

    const widest = Math.max(...sec.pts.map(([r]) => r));
    this.shadow.scale.setScalar(widest * 1.35);
    this.shadow.material.opacity = 0.75;

    this.builtFor = { stage: s, profile: this.profile };
  }

  /** Fit the camera to the pot, smoothly, so pulling it taller does not jolt the view. */
  private frame(dt: number, immediate = false) {
    const p = this.profile;
    const widest = Math.max(...this.section.pts.map(([r]) => r)) * 2;
    const air = this.options.air ?? 2.2;
    // Tall enough for the pot, and wide enough for it on a narrow screen.
    const wantH = Math.max(p.lip.y * air, (widest * air * (this.camera.aspect < 1 ? 1.05 : 0.8)) / Math.min(1, this.camera.aspect), 17);
    const wantY = p.lip.y * 0.4;
    const k = immediate ? 1 : 1 - Math.exp(-dt * 6);
    this.frameH += (wantH - this.frameH) * k;
    this.frameY += (wantY - this.frameY) * k;

    const fov = THREE.MathUtils.degToRad(this.camera.fov);
    const dist = this.frameH / 2 / Math.tan(fov / 2);
    const tilt = THREE.MathUtils.degToRad(14);
    const cx = this.options.anchorX ?? 0.5;
    // Shift the view so the pot stands at anchorX across the canvas.
    const halfW = (this.frameH / 2) * this.camera.aspect;
    const shift = (0.5 - cx) * 2 * halfW;
    this.camera.position.set(shift, this.frameY + Math.sin(tilt) * dist, Math.cos(tilt) * dist);
    this.camera.lookAt(shift, this.frameY, 0);
  }

  /**
   * Where a point on the pot's right-hand silhouette lands on the canvas, in
   * CSS pixels. The silhouette of a ring of radius r is not at (r, y, 0) but
   * where the line of sight grazes it, a little towards the camera.
   */
  project(r: number, y: number): { x: number; y: number } {
    const c = this.camera.position;
    const d = Math.max(r + 0.01, Math.hypot(c.x, c.z));
    const ux = c.x / d;
    const uz = c.z / d;
    const cos = r / d;
    const sin = Math.sqrt(1 - cos * cos);
    const px = r * (cos * ux + sin * uz);
    const pz = r * (cos * uz - sin * ux);
    const v = new THREE.Vector3(px, y, pz).project(this.camera);
    return { x: ((v.x + 1) / 2) * this.width, y: ((1 - v.y) / 2) * this.height };
  }

  /** CSS pixels per centimetre at the pot's axis. */
  pxPerCm(): number {
    const a = this.project(0, this.frameY);
    const b = this.project(1, this.frameY);
    return Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, this.width < 700 ? 1.75 : 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.frame(0, true);
    this.draw();
  }

  private draw() {
    this.renderer.render(this.scene, this.camera);
    this.onFrame?.();
  }

  private tick = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000);
    this.last = now;

    // Ease the displayed stage towards the target.
    if (Math.abs(this.target - this.stage) > 0.001) {
      const k = 1 - Math.exp(-dt * 3.2);
      this.stage += (this.target - this.stage) * k;
      if (Math.abs(this.target - this.stage) < 0.002) this.stage = this.target;
    }
    if (this.builtFor.stage !== this.stage || this.builtFor.profile !== this.profile) this.rebuild();

    // The wheel slows to a stop once the pot is off it.
    const onWheel = this.options.wheelAlways ? 1 : Math.max(0, 1 - this.stage);
    this.angle += dt * this.spin * Math.PI * 2 * onWheel;
    // Off the wheel, the pot is turned slowly by hand, the way one looks at a pot.
    if (onWheel < 1) this.angle += dt * 0.12 * (1 - onWheel) * (this.spin > 0 ? 1 : 0);
    this.turntable.rotation.y = this.angle;

    this.frame(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.tick);
  };

  /** Draw once more even if stopped, for a stage change while off screen. */
  private kick() {
    if (!this.running) {
      this.stage = this.target;
      this.rebuild();
      this.frame(0, true);
      this.draw();
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = 0;
    this.raf = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /** Re-render without the loop, for a profile change while paused. */
  redraw() {
    if (this.running) return;
    if (this.builtFor.profile !== this.profile) this.rebuild();
    this.frame(0, true);
    this.draw();
  }

  dispose() {
    this.stop();
    this.pot.geometry.dispose();
    this.pot.material.dispose();
    this.wheel.geometry.dispose();
    for (const m of this.wheel.material) {
      m.map?.dispose();
      m.dispose();
    }
    this.shadow.geometry.dispose();
    this.shadow.material.map?.dispose();
    this.shadow.material.dispose();
    this.scene.environment?.dispose();
    this.pmrem.dispose();
    this.renderer.dispose();
  }
}
