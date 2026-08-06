/**
 * Curl-noise fog.
 *
 * A divergence-free 2D velocity field is derived as the curl of a scalar
 * noise potential, and the density field is advected along it. Because the
 * field is divergence-free the fog swirls and folds instead of pumping in
 * and out, which is what makes it read as volume rather than as a moving
 * texture. Time enters as the third axis of the noise, so the pattern
 * evolves as well as drifts and never visibly repeats.
 *
 * Four noise evaluations per pixel, down from six after profiling. The curl
 * now uses forward differences (three samples, reusing the centre) instead
 * of central differences, and density is a single octave — the second one
 * was adding detail that the half-resolution buffer immediately threw away.
 * Rendered below half resolution; the result is soft enough that nothing
 * visible is lost and the fragment cost drops by roughly half.
 */

export const fogVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const fogFragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform vec2  uResolution;
  uniform float uTime;
  uniform vec2  uPointer;        // 0..1, y down
  uniform float uPointerAmount;  // 0 on touch/reduced motion

  /* --- Simplex noise 3D (Ashima Arts / Stefan Gustavson, MIT) ---------- */

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  /* --- Curl of a scalar potential ------------------------------------- */

  float potential(vec2 p, float t) {
    return snoise(vec3(p * 0.85, t));
  }

  // Forward differences: three samples instead of four, because the centre
  // is shared between both partial derivatives. Still divergence-free.
  vec2 curl(vec2 p, float t) {
    const float e = 0.11;
    float n0 = potential(p, t);
    float nUp = potential(p + vec2(0.0, e), t);
    float nRight = potential(p + vec2(e, 0.0), t);
    return vec2(nUp - n0, n0 - nRight) / e;
  }

  void main() {
    // Aspect-corrected domain so the fog does not stretch on wide screens.
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);

    float t = uTime * 0.035;

    vec2 flow = curl(p * 1.6, t);
    vec2 advected = p + flow * 0.14;

    // One octave. At this render scale the second octave's detail did not
    // survive the upscale, so it was cost with nothing to show for it.
    float density = snoise(vec3(advected * 2.1, t * 1.5)) * 0.9;

    density = smoothstep(-0.35, 0.85, density);

    // A light hangs above the page: the top of the frame is fractionally
    // warmer, and the corners fall away.
    float overhead = smoothstep(1.05, -0.15, uv.y);
    float vignette = smoothstep(1.25, 0.15, length(p * vec2(0.82, 1.0)));

    density *= mix(0.45, 1.0, overhead) * vignette;

    // The cursor is a light here too — it lifts the fog it passes through.
    vec2 pointerP = (uPointer - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
    pointerP.y = -pointerP.y;
    float toPointer = length(p - pointerP);
    float lamp = exp(-toPointer * toPointer * 5.2) * uPointerAmount;

    vec3 base   = vec3(0.027, 0.031, 0.043);
    vec3 vapour = vec3(0.086, 0.104, 0.145);
    vec3 signal = vec3(0.290, 0.243, 0.720);

    vec3 color = base;
    color = mix(color, vapour, density * 0.55);
    color += signal * lamp * (0.10 + density * 0.16);

    // Ordered dither. Banding is unavoidable at this dynamic range on 8-bit
    // displays, and a grain overlay alone does not fix gradients this dark.
    float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    color += (dither - 0.5) / 255.0;

    gl_FragColor = vec4(color, 1.0);
  }
`;
