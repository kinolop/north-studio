import * as THREE from "three";

import { CONE_F, CONE_N, EXTENT, LAM0, ORIGIN_SHIFT } from "@/lib/marshrut/geo";

import type { GeoField } from "./geoField";

/**
 * The ground everything stands on.
 *
 * One huge quad, one fragment shader. Up close it is the concrete apron of a
 * loading dock at night: dark, with a faint measuring grid whose spacing is
 * always a power of ten (so the ruler and the floor agree), and a warm pool
 * under the lamp where the pallet stands. As the camera climbs the floor
 * gives way to a night atlas: land a shade lighter than the sea, contours
 * stepping out from every coast, the graticule. The coasts, borders and
 * rivers themselves are real hairlines drawn by `MapLines`; nothing here is a
 * picture of a map, every tone is computed from distances.
 */

const VERT = /* glsl */ `
varying vec2 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const FRAG = /* glsl */ `
precision highp float;

varying vec2 vW;

uniform sampler2D uGeo;
uniform vec4 uExtent;
uniform vec2 uShift;
uniform vec3 uCone;
uniform vec3 uNight;
uniform vec3 uLand;
uniform vec3 uSea;
uniform vec3 uFloor;
uniform vec3 uBone;
uniform vec3 uLamp;
uniform vec3 uLampAt;
uniform vec3 uCam;
uniform vec2 uFog;
uniform float uMap;
uniform float uGrid;
uniform float uWide;
uniform float uGrat;
uniform float uContour;
uniform float uReady;

const float R = 6371000.0;
const float PI = 3.14159265359;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Inverse of the Lambert conic, matching lib/marshrut/geo.ts.
vec2 unproj(vec2 w) {
  float sx = (w.x + uShift.x) / R;
  float y = -(w.y + uShift.y) / R;
  float fy = uCone.y - y;
  float r = sqrt(sx * sx + fy * fy);
  float l = atan(sx, fy);
  return vec2(l / uCone.x + uCone.z, 2.0 * atan(pow(uCone.y / r, 1.0 / uCone.x)) - 1.5707963);
}

// Coverage of a line of width wpx (pixels) at distance dist, in units where one pixel is aa.
float ln(float dist, float aa, float wpx) {
  float d = dist / max(aa, 1e-6);
  return 1.0 - smoothstep(wpx * 0.5 - 0.65, wpx * 0.5 + 0.65, d);
}

float gridLevel(vec2 w, float s, float wpp) {
  vec2 q = abs(fract(w / s + 0.5) - 0.5) * s;
  float spacing = s / wpp;
  float vis = smoothstep(7.0, 26.0, spacing) * (1.0 - smoothstep(900.0, 3200.0, spacing));
  return ln(min(q.x, q.y), wpp, 1.0) * vis;
}

void main() {
  vec2 w = vW;
  float depth = distance(uCam, vec3(w.x, 0.0, w.y));
  float fog = smoothstep(uFog.x, uFog.y, depth);

  vec2 uv = (w - uExtent.xy) / uExtent.zw;
  vec4 g = texture2D(uGeo, uv);
  float edge = smoothstep(0.0, 0.1, min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)));
  edge *= uReady;

  float sdf = g.r;
  float aaS = max(fwidth(sdf), 1e-4);
  float land = smoothstep(-aaS, aaS, sdf);

  // Lakes are tinted like sea; their shores are drawn as hairlines elsewhere.
  float lake = smoothstep(0.35, 0.65, g.a);
  vec3 seaLand = mix(mix(uSea, uLand, land), mix(uSea, uLand, 0.4), lake * land);
  // Land lifts a little toward its coast, the way a lit shoreline reads from orbit.
  seaLand += land * (1.0 - lake) * exp(-max(sdf, 0.0) / 70.0) * 0.018;
  // And the sea deepens away from it.
  seaLand -= (1.0 - land) * smoothstep(0.0, 900.0, -sdf) * 0.012;
  vec3 atlasCol = mix(uNight, seaLand, edge);

  // The dock: concrete, and the pool of a sodium lamp around the cargo.
  float r = distance(w, uLampAt.xy);
  float pool = exp(-(r * r) / (uLampAt.z * uLampAt.z));
  float spill = exp(-(r * r) / (uLampAt.z * uLampAt.z * 9.0));
  vec3 floorCol = uFloor * (0.18 + 0.82 * max(spill, uWide * 0.45)) + uLamp * (pool * 0.15 + spill * 0.02);

  vec3 base = mix(floorCol, atlasCol, uMap);

  // Sea contours, stepping out from the shore and fading away from it.
  float dsea = max(-sdf, 0.0);
  float ci = dsea / uContour;
  float cfrac = abs(fract(ci + 0.5) - 0.5) * uContour;
  float contour = ln(cfrac, max(fwidth(dsea), 1e-4), 1.0);
  contour *= smoothstep(0.55, 1.0, ci) * (1.0 - smoothstep(1.6, 2.6, ci)) * step(sdf, 0.0);

  vec2 deg = unproj(w) * (180.0 / PI);
  vec2 gd = abs(fract(deg / uGrat + 0.5) - 0.5) * uGrat;
  vec2 gaa = max(fwidth(deg), vec2(1e-6));
  float grat = max(ln(gd.x, gaa.x, 0.9), ln(gd.y, gaa.y, 0.9));

  float wpp = max(length(vec2(dFdx(w.x), dFdx(w.y))), length(vec2(dFdy(w.x), dFdy(w.y))));
  float grid = 0.0;
  grid = max(grid, gridLevel(w, 0.1, wpp) * 0.55);
  grid = max(grid, gridLevel(w, 1.0, wpp));
  grid = max(grid, gridLevel(w, 10.0, wpp));
  grid = max(grid, gridLevel(w, 100.0, wpp));
  grid = max(grid, gridLevel(w, 1000.0, wpp));
  grid = max(grid, gridLevel(w, 10000.0, wpp));

  float atlas = uMap * edge;
  float ink =
    grid * (0.012 + 0.07 * pool + 0.022 * uWide) * max(spill, uWide) * uGrid * (1.0 - uMap) +
    (contour * 0.0 + grat * 0.026) * atlas;

  vec3 col = mix(base, uBone, clamp(ink, 0.0, 1.0));

  col += (hash(gl_FragCoord.xy) - 0.5) * 0.008;
  col = mix(col, uNight, fog);

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

function makeTexture(field: GeoField | null): THREE.DataTexture {
  const texture = new THREE.DataTexture(
    field ? field.data : new Uint16Array([0, 0, 0, 0]),
    field ? field.width : 1,
    field ? field.height : 1,
    THREE.RGBAFormat,
    THREE.HalfFloatType,
  );
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.flipY = false;
  texture.needsUpdate = true;
  return texture;
}

export interface PlateLook {
  night: string;
  land: string;
  sea: string;
  floor: string;
  bone: string;
  lamp: string;
}

export class Plate {
  readonly mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private texture: THREE.DataTexture;

  constructor(field: GeoField | null, look: PlateLook) {
    const geometry = new THREE.PlaneGeometry(1, 1);
    geometry.rotateX(-Math.PI / 2);

    // A one-texel stand-in until the real field arrives, so the ground can be
    // drawn (as bare concrete) from the very first frame.
    this.texture = makeTexture(field);

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uGeo: { value: this.texture },
        uExtent: {
          value: new THREE.Vector4(EXTENT.x0, EXTENT.z0, EXTENT.x1 - EXTENT.x0, EXTENT.z1 - EXTENT.z0),
        },
        uShift: { value: new THREE.Vector2(ORIGIN_SHIFT[0], ORIGIN_SHIFT[1]) },
        uCone: { value: new THREE.Vector3(CONE_N, CONE_F, (LAM0 * Math.PI) / 180) },
        uNight: { value: new THREE.Color(look.night) },
        uLand: { value: new THREE.Color(look.land) },
        uSea: { value: new THREE.Color(look.sea) },
        uFloor: { value: new THREE.Color(look.floor) },
        uBone: { value: new THREE.Color(look.bone) },
        uLamp: { value: new THREE.Color(look.lamp) },
        uLampAt: { value: new THREE.Vector3(0, 0, 6) },
        uCam: { value: new THREE.Vector3() },
        uFog: { value: new THREE.Vector2(1e3, 1e4) },
        uMap: { value: 0 },
        uGrid: { value: 1 },
        uWide: { value: 0 },
        uGrat: { value: 10 },
        uContour: { value: 70 },
        uReady: { value: field ? 1 : 0 },
      },
      depthWrite: true,
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -10;
  }

  /**
   * Swaps in the real field. A new texture rather than new pixels for the old
   * one: GPU storage is allocated once at the size it was first given, and
   * the stand-in is one texel.
   */
  setField(field: GeoField) {
    const previous = this.texture;
    this.texture = makeTexture(field);
    this.material.uniforms.uGeo!.value = this.texture;
    this.material.uniforms.uReady!.value = 1;
    previous.dispose();
  }

  /** Keeps the quad under the camera and sized to the view, so it always reaches the horizon. */
  update(opts: {
    cam: THREE.Vector3;
    target: THREE.Vector3;
    dist: number;
    map: number;
    grid: number;
    /** 0 on the dock, where the grid lives in the lamp's pool; 1 high above it, where it covers the ground. */
    wide: number;
    grat: number;
    contour: number;
    lamp: { x: number; z: number; r: number };
  }) {
    const u = this.material.uniforms;
    u.uCam!.value.copy(opts.cam);
    u.uMap!.value = opts.map;
    u.uGrid!.value = opts.grid;
    u.uWide!.value = opts.wide;
    u.uGrat!.value = opts.grat;
    u.uContour!.value = opts.contour;
    (u.uLampAt!.value as THREE.Vector3).set(opts.lamp.x, opts.lamp.z, opts.lamp.r);
    u.uFog!.value.set(opts.dist * 9, opts.dist * 46);
    const reach = opts.dist * 80;
    this.mesh.scale.set(reach, 1, reach);
    this.mesh.position.set(opts.target.x, 0, opts.target.z);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
  }
}
