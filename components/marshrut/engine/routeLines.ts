import * as THREE from "three";

import type { ModeId } from "@/lib/marshrut/data";
import type { RoutePlan } from "@/lib/marshrut/route";

/**
 * The route, drawn in sodium light.
 *
 * Each of the three legs is a ribbon whose width is what that leg costs: the
 * border crossing swells where the paperwork is, a cheap sea leg is a
 * thread. Width is in screen pixels, not metres, so the ribbon stays legible
 * from six thousand kilometres up and still means the same thing when the
 * camera comes down to follow the cargo.
 *
 * Built as an instance per segment, a quad expanded in the vertex shader and
 * a distance-to-segment in the fragment shader, so ends are round and joints
 * need no special care.
 *
 * Three things animate it, all in the shader:
 *  - `progress`: nothing beyond this arc length is drawn, so a new route
 *    draws itself on;
 *  - `travelled` and `ahead`: the part behind the cargo burns at full
 *    strength, the part still to come is dimmed;
 *  - a slow train of brighter pulses running from origin to warehouse, the
 *    one sign on a still map that something is moving along it.
 *
 * The routes not taken are faint dashed threads, one layer per mode, so the
 * timetable can light up the one being pointed at.
 */

const VERT = /* glsl */ `
attribute vec3 aA;
attribute vec3 aB;
attribute vec2 aS;
attribute float aLeg;

uniform vec2 uRes;
uniform float uWidth[4];
uniform float uGrow;

varying vec2 vA;
varying vec2 vB;
varying float vHalf;
varying vec2 vS;
varying float vLeg;

void main() {
  int leg = int(aLeg + 0.5);
  vec4 ca = projectionMatrix * viewMatrix * vec4(aA, 1.0);
  vec4 cb = projectionMatrix * viewMatrix * vec4(aB, 1.0);
  if (ca.w <= 0.0 || cb.w <= 0.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }
  vec2 sa = (ca.xy / ca.w * 0.5 + 0.5) * uRes;
  vec2 sb = (cb.xy / cb.w * 0.5 + 0.5) * uRes;
  vec2 dir = sb - sa;
  float len = length(dir);
  dir = len > 1e-4 ? dir / len : vec2(1.0, 0.0);
  vec2 nrm = vec2(-dir.y, dir.x);

  float halfW = 0.5 * (uWidth[leg] + uGrow);
  float reach = halfW + 1.0;
  vec2 sp = mix(sa, sb, position.x) + dir * (position.x * 2.0 - 1.0) * reach + nrm * position.y * reach;

  vA = sa;
  vB = sb;
  vHalf = halfW;
  vS = aS;
  vLeg = aLeg;
  gl_Position = vec4(sp / uRes * 2.0 - 1.0, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vA;
varying vec2 vB;
varying float vHalf;
varying vec2 vS;
varying float vLeg;

uniform vec3 uColor;
uniform vec3 uHot;
uniform vec3 uDim;
uniform float uAlpha;
uniform float uProgress;
uniform float uTravelled;
uniform float uAhead;
uniform float uDash;
uniform float uMpp;
uniform float uTime;
uniform float uPulse;
uniform float uLegAlpha[4];

void main() {
  vec2 p = gl_FragCoord.xy;
  vec2 pa = p - vA;
  vec2 ba = vB - vA;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  float d = length(pa - ba * h);
  float cover = 1.0 - smoothstep(vHalf - 0.6, vHalf + 0.6, d);

  float s = mix(vS.x, vS.y, h);
  cover *= 1.0 - smoothstep(uProgress - 1.0, uProgress + 1.0, s);

  // Screen pixels along the route, for dashes and pulses that keep their size at every zoom.
  float px = s / max(uMpp, 1e-6);

  if (uDash > 0.0) {
    float phase = fract(px / uDash);
    cover *= step(phase, 0.5);
  }

  float ahead = smoothstep(uTravelled - 2.0 * uMpp, uTravelled + 2.0 * uMpp, s);
  float a = mix(1.0, uAhead, ahead);

  // A short bright head with a longer tail, every 340 px, moving at 70 px a second.
  float ph = fract((px - uTime * 46.0) / 620.0);
  float pulse = smoothstep(0.0, 0.02, ph) * (1.0 - smoothstep(0.02, 0.16, ph));
  pulse *= uPulse * mix(0.55, 1.0, ahead);

  // The road ahead is dimmed by darkening, not by transparency: overlapping
  // translucent segments would bead at every joint.
  int leg = int(vLeg + 0.5);
  vec3 col = mix(uDim, uColor, a);
  col = mix(col, uHot, pulse);
  float alpha = cover * uAlpha * uLegAlpha[leg];
  gl_FragColor = vec4(col, alpha);
  #include <colorspace_fragment>
}
`;

const BIG = 1e12;

export interface RouteLook {
  amber: string;
  hot: string;
  night: string;
  bone: string;
}

/** Width of a leg's ribbon, CSS pixels, from its share of the bill. */
export const legWidth = (share: number) => 1.5 + 3.4 * Math.pow(Math.min(1, Math.max(0, share)), 0.9);

interface Layer {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
}

export class RouteLines {
  readonly scene = new THREE.Scene();
  private casing: Layer | null = null;
  private core: Layer | null = null;
  private ghost: Layer | null = null;
  private alts = new Map<ModeId, Layer>();
  private dpr = 1;
  private res = new THREE.Vector2(1, 1);
  private widths = [12, 12, 12];
  /** Ribbons shrink a little on small screens, where the whole route is smaller too. */
  private scale = 1;
  private legAlpha = [1, 1, 1, 1];
  private look: RouteLook;
  progress = BIG;
  /** Arc length the cargo has covered. */
  travelled = BIG;
  /** Strength of the route still ahead of the cargo, 0..1. */
  ahead = 1;
  /** Strength of the routes not taken, 0..1 (1 is the timetable's view). */
  altStrength = 0;
  /** The route not taken that the reader is pointing at. */
  preview: ModeId | null = null;
  pulse = 1;

  constructor(look: RouteLook) {
    this.look = look;
  }

  private layer(data: Float32Array, color: string, order: number): Layer {
    const count = Math.floor(data.length / 9);
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([0, -1, 0, 1, -1, 0, 1, 1, 0, 0, 1, 0]), 3),
    );
    geometry.setIndex([0, 1, 2, 0, 2, 3]);
    const buffer = new THREE.InstancedInterleavedBuffer(data, 9);
    geometry.setAttribute("aA", new THREE.InterleavedBufferAttribute(buffer, 3, 0));
    geometry.setAttribute("aB", new THREE.InterleavedBufferAttribute(buffer, 3, 3));
    geometry.setAttribute("aS", new THREE.InterleavedBufferAttribute(buffer, 2, 6));
    geometry.setAttribute("aLeg", new THREE.InterleavedBufferAttribute(buffer, 1, 8));
    geometry.instanceCount = count;

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uRes: { value: this.res },
        uWidth: { value: [12, 12, 12, 1.2] },
        uGrow: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uHot: { value: new THREE.Color(this.look.hot) },
        uDim: { value: new THREE.Color(color).lerp(new THREE.Color(this.look.night), 0.9) },
        uAlpha: { value: 1 },
        uProgress: { value: BIG },
        uTravelled: { value: BIG },
        uAhead: { value: 1 },
        uDash: { value: 0 },
        uMpp: { value: 1 },
        uTime: { value: 0 },
        uPulse: { value: 0 },
        uLegAlpha: { value: this.legAlpha },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.renderOrder = order;
    this.scene.add(mesh);
    return { mesh, material };
  }

  private drop(layer: Layer | null | undefined) {
    if (!layer) return;
    this.scene.remove(layer.mesh);
    layer.mesh.geometry.dispose();
    layer.material.dispose();
  }

  /** Nine floats per segment: a (xyz), b (xyz), arc lengths, leg. */
  private pack(plan: RoutePlan, flat = false, legOverride?: number): Float32Array {
    const out: number[] = [];
    plan.legs.forEach((leg, index) => {
      let s = leg.s0;
      for (let i = 1; i < leg.points.length; i++) {
        const a = leg.points[i - 1]!;
        const b = leg.points[i]!;
        const len = Math.hypot(b.x - a.x, b.z - a.z);
        // Lift is looked up by arc length, so a flight rises along the route
        // and the legs after it stay on the ground.
        const ya = flat ? 0 : liftAt(plan, s);
        const yb = flat ? 0 : liftAt(plan, s + len);
        out.push(a.x, ya, a.z, b.x, yb, b.z, s, s + len, legOverride ?? index);
        s += len;
      }
    });
    return new Float32Array(out);
  }

  set(plan: RoutePlan, alternatives: RoutePlan[]) {
    this.drop(this.casing);
    this.drop(this.core);
    this.drop(this.ghost);
    for (const layer of this.alts.values()) this.drop(layer);
    this.alts.clear();

    const data = this.pack(plan);
    this.casing = this.layer(data, this.look.night, 1);
    this.core = this.layer(data, this.look.amber, 2);
    this.ghost = plan.mode === "air" ? this.layer(this.pack(plan, true), this.look.bone, 0) : null;
    for (const other of alternatives) {
      this.alts.set(other.mode, this.layer(this.pack(other, true, 3), this.look.bone, 0));
    }
    this.applyWidths();
  }

  /** Ribbon widths in CSS pixels, one per leg. */
  setWidths(widths: [number, number, number]) {
    this.widths = widths;
    this.applyWidths();
  }

  private applyWidths() {
    const thread = [1.1, 1.1, 1.1, 1.1].map((w) => w * this.dpr);
    const ribbon = [...this.widths.map((w) => w * this.scale * this.dpr), 1];
    if (this.casing) {
      this.casing.material.uniforms.uWidth!.value = ribbon;
      this.casing.material.uniforms.uGrow!.value = 3 * this.dpr;
    }
    if (this.core) this.core.material.uniforms.uWidth!.value = ribbon;
    if (this.ghost) this.ghost.material.uniforms.uWidth!.value = thread;
    for (const layer of this.alts.values()) layer.material.uniforms.uWidth!.value = thread;
  }

  setScale(scale: number) {
    this.scale = scale;
    this.applyWidths();
  }

  /** Dims every leg but one; -1 restores all of them. */
  highlight(leg: number) {
    for (let i = 0; i < 3; i++) this.legAlpha[i] = leg < 0 || leg === i ? 1 : 0.32;
  }

  setSize(width: number, height: number, dpr: number) {
    this.dpr = dpr;
    this.res.set(width, height);
    this.applyWidths();
  }

  render(renderer: THREE.WebGLRenderer, camera: THREE.Camera, mpp: number, fade: number, time: number) {
    if (!this.core || fade < 0.004) return;
    const px = mpp / this.dpr;
    const set = (layer: Layer | null | undefined, alpha: number, dash: number) => {
      if (!layer) return;
      const u = layer.material.uniforms;
      u.uProgress!.value = this.progress;
      u.uMpp!.value = px;
      u.uDash!.value = dash * this.dpr;
      u.uAlpha!.value = alpha * fade;
      u.uTime!.value = time;
    };
    set(this.casing, 0.86, 0);
    set(this.core, 1, 0);
    const core = this.core.material.uniforms;
    core.uTravelled!.value = this.travelled;
    core.uAhead!.value = this.ahead;
    core.uPulse!.value = this.pulse;
    const cas = this.casing?.material.uniforms;
    if (cas) {
      cas.uTravelled!.value = this.travelled;
      cas.uAhead!.value = Math.max(0.5, this.ahead);
    }
    set(this.ghost, 0.2, 7);

    for (const [mode, layer] of this.alts) {
      const on = this.preview === mode;
      const u = layer.material.uniforms;
      set(layer, on ? 0.95 : 0.14 + 0.2 * this.altStrength, on ? 10 : 7);
      (u.uColor!.value as THREE.Color).set(on ? this.look.hot : this.look.bone);
      const w = (on ? 2.2 : 1.1) * this.dpr;
      u.uWidth!.value = [w, w, w, w];
    }
    renderer.render(this.scene, camera);
  }

  dispose() {
    this.drop(this.casing);
    this.drop(this.core);
    this.drop(this.ghost);
    for (const layer of this.alts.values()) this.drop(layer);
  }
}

function liftAt(plan: RoutePlan, s: number): number {
  if (plan.mode !== "air") return 0;
  let lo = 0;
  let hi = plan.cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if ((plan.cum[mid] ?? 0) <= s) lo = mid;
    else hi = mid;
  }
  const c0 = plan.cum[lo] ?? 0;
  const c1 = plan.cum[hi] ?? 1;
  const t = c1 === c0 ? 0 : Math.min(1, Math.max(0, (s - c0) / (c1 - c0)));
  const l0 = plan.lift[lo] ?? 0;
  const l1 = plan.lift[hi] ?? 0;
  return l0 + (l1 - l0) * t;
}
