import * as THREE from "three";

import { along, type RoutePlan } from "@/lib/marshrut/route";
import { mulberry32 } from "@/lib/marshrut/util";

/**
 * The queue at the border crossing.
 *
 * Two lanes of trucks standing nose to tail on the approach to the
 * crossing, a few hundred kilometres of cab lights beside the line. They sit
 * a fixed number of pixels to the side of the route rather than a fixed
 * number of kilometres, so at any height they read as a lane next to the
 * road and the cargo can be seen passing them on its own line.
 *
 * Shown only while the border chapter is on screen; the lights flicker very
 * slightly, the way engines idling at night do from far off.
 */

const VERT = /* glsl */ `
attribute vec2 aPos;
attribute vec2 aDir;
attribute float aLane;
attribute float aB;

uniform vec2 uRes;
uniform float uScale;
uniform float uTime;

varying vec2 vUv;
varying float vB;

void main() {
  vec4 c = projectionMatrix * viewMatrix * vec4(aPos.x, 0.0, aPos.y, 1.0);
  vec4 d = projectionMatrix * viewMatrix * vec4(aPos.x + aDir.x, 0.0, aPos.y + aDir.y, 1.0);
  if (c.w <= 0.0 || d.w <= 0.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }
  // The route's direction on screen, and the side of it the lanes stand on.
  vec2 sc = c.xy / c.w * uRes * 0.5;
  vec2 sd = d.xy / d.w * uRes * 0.5;
  vec2 t = normalize(sd - sc + vec2(1e-6));
  vec2 n = vec2(-t.y, t.x);
  vec2 px = n * aLane * uScale + position.xy * 2.1 * uScale;
  vUv = position.xy;
  vB = aB * (0.85 + 0.15 * sin(uTime * 3.0 + aB * 40.0));
  gl_Position = c + vec4(px / (uRes * 0.5) * c.w, 0.0, 0.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
varying float vB;
uniform vec3 uColor;
uniform float uFade;

void main() {
  float r2 = dot(vUv, vUv);
  if (r2 > 1.0) discard;
  float a = exp(-r2 * 6.0) * vB * uFade;
  gl_FragColor = vec4(uColor * a, 1.0);
}
`;

export class QueueLights {
  readonly scene = new THREE.Scene();
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh | null = null;
  private res = new THREE.Vector2(1, 1);
  fade = 0;

  constructor(color: string) {
    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uRes: { value: this.res },
        uScale: { value: 1 },
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uFade: { value: 0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }

  /** Lines the queue up behind this route's crossing. */
  set(route: RoutePlan) {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
    }
    const random = mulberry32(2026_0930);
    const pos: number[] = [];
    const dir: number[] = [];
    const lane: number[] = [];
    const bright: number[] = [];
    // The queue ends at the crossing itself and reaches back along the approach.
    const end = route.gate.s;
    const length = Math.min(260_000, end * 0.5);
    for (const offset of [9, 14]) {
      for (let s = end - 2_000; s > end - length; s -= 1_100 + random() * 700) {
        const p = along(route, s);
        pos.push(p.x, p.z);
        dir.push(Math.cos(p.heading) * 1000, Math.sin(p.heading) * 1000);
        lane.push(offset + (random() - 0.5) * 1.5);
        bright.push(0.65 + random() * 0.35);
      }
    }
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]), 3),
    );
    geometry.setIndex([0, 1, 2, 0, 2, 3]);
    geometry.setAttribute("aPos", new THREE.InstancedBufferAttribute(new Float32Array(pos), 2));
    geometry.setAttribute("aDir", new THREE.InstancedBufferAttribute(new Float32Array(dir), 2));
    geometry.setAttribute("aLane", new THREE.InstancedBufferAttribute(new Float32Array(lane), 1));
    geometry.setAttribute("aB", new THREE.InstancedBufferAttribute(new Float32Array(bright), 1));
    geometry.instanceCount = bright.length;
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  setSize(width: number, height: number, dpr: number) {
    this.res.set(width, height);
    this.material.uniforms.uScale!.value = dpr;
  }

  render(renderer: THREE.WebGLRenderer, camera: THREE.Camera, atlas: number, time: number) {
    const a = this.fade * atlas;
    if (!this.mesh || a < 0.004) return;
    this.material.uniforms.uFade!.value = a;
    this.material.uniforms.uTime!.value = time;
    renderer.render(this.scene, camera);
  }

  dispose() {
    this.mesh?.geometry.dispose();
    this.material.dispose();
  }
}
