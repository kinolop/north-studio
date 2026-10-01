import * as THREE from "three";

/**
 * The map's hairlines.
 *
 * Every coast, border, river and lake shore is a real line: one instance per
 * segment, expanded to a quad in screen space by the vertex shader, so a
 * hairline is a hairline at every zoom. The fragment shader measures the
 * distance to the segment itself, which is what makes the ends round and
 * lets a segment shorter than a pixel still land in the right place.
 *
 * Segments overlap at their joints, and with translucent ink that would
 * print a darker bead at every vertex. So the lines are drawn into their own
 * target with MAX blending (the strongest coverage wins rather than adding up)
 * and laid over the ground in a second step.
 *
 * Land lines (coasts, borders) and water lines (rivers, lake shores) are kept
 * in separate channels of that target, so the composite can draw the first
 * in pale bone and the second in a cold steel blue without a second pass.
 */

const SEGMENT_VERT = /* glsl */ `
attribute vec2 aA;
attribute vec2 aB;
attribute float aKind;

uniform vec2 uRes;
uniform float uWidth[4];
uniform float uAlpha[4];

varying vec2 vA;
varying vec2 vB;
varying float vHalf;
varying float vOpacity;
varying float vWater;

void main() {
  int kind = int(aKind + 0.5);
  vec4 ca = projectionMatrix * viewMatrix * vec4(aA.x, 0.0, aA.y, 1.0);
  vec4 cb = projectionMatrix * viewMatrix * vec4(aB.x, 0.0, aB.y, 1.0);
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

  float halfW = 0.5 * uWidth[kind];
  float reach = halfW + 1.0;
  vec2 sp = mix(sa, sb, position.x) + dir * (position.x * 2.0 - 1.0) * reach + nrm * position.y * reach;

  vA = sa;
  vB = sb;
  vHalf = halfW;
  vOpacity = uAlpha[kind];
  vWater = kind >= 2 ? 1.0 : 0.0;
  gl_Position = vec4(sp / uRes * 2.0 - 1.0, 0.0, 1.0);
}
`;

const SEGMENT_FRAG = /* glsl */ `
precision highp float;
varying vec2 vA;
varying vec2 vB;
varying float vHalf;
varying float vOpacity;
varying float vWater;
uniform float uFade;

void main() {
  vec2 p = gl_FragCoord.xy;
  vec2 pa = p - vA;
  vec2 ba = vB - vA;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  float d = length(pa - ba * h);
  float cover = 1.0 - smoothstep(vHalf - 0.5, vHalf + 0.5, d);
  float a = cover * vOpacity * uFade;
  gl_FragColor = vec4(a * (1.0 - vWater), a * vWater, 0.0, a);
}
`;

const COMPOSITE_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const COMPOSITE_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec3 uInk;
uniform vec3 uWater;
void main() {
  vec4 t = texture2D(uTex, vUv);
  float a = max(t.r, t.g);
  vec3 col = (uInk * t.r + uWater * t.g) / max(t.r + t.g, 1e-4);
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}
`;

export class MapLines {
  private scene = new THREE.Scene();
  private composite = new THREE.Scene();
  private compositeCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private target: THREE.WebGLRenderTarget;
  private segments: THREE.Mesh;
  private segmentMat: THREE.ShaderMaterial;
  private compositeMat: THREE.ShaderMaterial;
  private count: number;

  constructor(lines: Float32Array, ink: string, water: string) {
    const count = Math.floor(lines.length / 5);
    this.count = count;

    const geometry = new THREE.InstancedBufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([0, -1, 0, 1, -1, 0, 1, 1, 0, 0, 1, 0]), 3),
    );
    geometry.setIndex([0, 1, 2, 0, 2, 3]);
    const buffer = new THREE.InstancedInterleavedBuffer(lines, 5);
    geometry.setAttribute("aA", new THREE.InterleavedBufferAttribute(buffer, 2, 0));
    geometry.setAttribute("aB", new THREE.InterleavedBufferAttribute(buffer, 2, 2));
    geometry.setAttribute("aKind", new THREE.InterleavedBufferAttribute(buffer, 1, 4));
    geometry.instanceCount = count;

    this.segmentMat = new THREE.ShaderMaterial({
      vertexShader: SEGMENT_VERT,
      fragmentShader: SEGMENT_FRAG,
      uniforms: {
        uRes: { value: new THREE.Vector2(1, 1) },
        // Coast, border, river, lake shore: device pixels and opacity.
        uWidth: { value: [1.2, 0.85, 0.8, 0.95] },
        uAlpha: { value: [0.46, 0.2, 0.42, 0.5] },
        uFade: { value: 1 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.MaxEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendEquationAlpha: THREE.MaxEquation,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneFactor,
    });
    this.segments = new THREE.Mesh(geometry, this.segmentMat);
    this.segments.frustumCulled = false;
    this.scene.add(this.segments);

    this.target = new THREE.WebGLRenderTarget(1, 1, {
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthBuffer: false,
      generateMipmaps: false,
    });

    this.compositeMat = new THREE.ShaderMaterial({
      vertexShader: COMPOSITE_VERT,
      fragmentShader: COMPOSITE_FRAG,
      uniforms: {
        uTex: { value: this.target.texture },
        uInk: { value: new THREE.Color(ink) },
        uWater: { value: new THREE.Color(water) },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const tri = new THREE.BufferGeometry();
    tri.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
    const quad = new THREE.Mesh(tri, this.compositeMat);
    quad.frustumCulled = false;
    this.composite.add(quad);
  }

  /** Sizes the target to the drawing buffer; widths are given in CSS pixels. */
  setSize(width: number, height: number, dpr: number) {
    this.target.setSize(width, height);
    const u = this.segmentMat.uniforms;
    (u.uRes!.value as THREE.Vector2).set(width, height);
    u.uWidth!.value = [1.15 * dpr, 0.8 * dpr, 0.75 * dpr, 0.9 * dpr];
  }

  render(renderer: THREE.WebGLRenderer, camera: THREE.Camera, fade: number) {
    if (fade < 0.004 || this.count === 0) return;
    this.segmentMat.uniforms.uFade!.value = fade;

    const prevColor = renderer.getClearColor(new THREE.Color());
    const prevAlpha = renderer.getClearAlpha();
    renderer.setRenderTarget(this.target);
    renderer.setClearColor(0x000000, 0);
    renderer.clear(true, false, false);
    renderer.render(this.scene, camera);
    renderer.setRenderTarget(null);
    renderer.setClearColor(prevColor, prevAlpha);
    renderer.render(this.composite, this.compositeCam);
  }

  dispose() {
    this.segments.geometry.dispose();
    this.segmentMat.dispose();
    this.compositeMat.dispose();
    this.target.dispose();
  }
}
