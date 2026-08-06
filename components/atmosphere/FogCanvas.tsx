"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import { subscribePointer } from "@/lib/pointer";
import { qualityTier, type Tier } from "@/lib/quality";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { fogFragmentShader, fogVertexShader } from "./fog.glsl";

/** Fog is soft, so it is rendered well below display resolution and
 *  upscaled. Nobody can tell; the GPU very much can. */
const RENDER_SCALE: Record<Tier, number> = { standard: 0.42, low: 0.3 };
/** Hard ceiling for very large displays. */
const MAX_PIXELS: Record<Tier, number> = { standard: 520_000, low: 240_000 };
/** Atmosphere does not need 60fps. */
const TARGET_FPS = 30;

/**
 * Mechanic 4 — the base atmosphere behind every section.
 *
 * Deliberately not React Three Fiber: this is one quad with one material and
 * no scene graph, so the reconciler would be pure overhead on a pass that
 * runs behind the entire page. Raw three keeps it to a single draw call.
 */
export function FogCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        alpha: false,
        powerPreference: "low-power",
      });
    } catch {
      // No WebGL: the CSS gradient underneath is the fallback and is enough.
      return;
    }

    renderer.setClearColor(0x07080b, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0.62, 0.36) },
      uPointerAmount: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: fogVertexShader,
      fragmentShader: fogFragmentShader,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });

    const quad = new THREE.Mesh(geometry, material);
    quad.frustumCulled = false;
    scene.add(quad);

    const tier = qualityTier();

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      let scale = RENDER_SCALE[tier];
      const budget = Math.sqrt(MAX_PIXELS[tier] / (w * h));
      if (budget < scale) scale = budget;

      renderer.setPixelRatio(1);
      renderer.setSize(Math.round(w * scale), Math.round(h * scale), false);
      uniforms.uResolution.value.set(w, h);
    };

    resize();
    window.addEventListener("resize", resize);

    const unsubscribePointer = subscribePointer((signal) => {
      uniforms.uPointer.value.set(
        signal.x / (window.innerWidth || 1),
        signal.y / (window.innerHeight || 1),
      );
    });

    let rafId = 0;
    let disposed = false;
    const frameInterval = 1 / TARGET_FPS;
    let accumulator = 0;
    let elapsed = 0;
    let lastFrame = 0;

    const loop = (now: number) => {
      if (disposed) return;
      rafId = window.requestAnimationFrame(loop);

      // Clamped so a backgrounded tab or a stalled frame cannot jump the
      // fog forward by seconds when it resumes.
      const delta = lastFrame === 0 ? 0 : Math.min((now - lastFrame) / 1000, 0.1);
      lastFrame = now;

      accumulator += delta;
      if (accumulator < frameInterval) return;
      accumulator %= frameInterval;

      elapsed += delta;
      uniforms.uTime.value = elapsed;
      // Ease the cursor lamp in so it does not pop on first movement.
      uniforms.uPointerAmount.value += (1 - uniforms.uPointerAmount.value) * 0.04;
      renderer.render(scene, camera);
    };

    const start = () => {
      if (rafId !== 0 || disposed || reduced) return;
      lastFrame = 0; // discard whatever elapsed while paused
      rafId = window.requestAnimationFrame(loop);
    };

    const stop = () => {
      if (rafId === 0) return;
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    };

    if (reduced) {
      // One static frame. Composed, legible, and completely still.
      uniforms.uTime.value = 128;
      uniforms.uPointerAmount.value = 0.35;
      renderer.render(scene, camera);
    } else {
      start();
    }

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      unsubscribePointer();

      // three never releases GPU memory on its own.
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{ display: "block" }}
    />
  );
}
