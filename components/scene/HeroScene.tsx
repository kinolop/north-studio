"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { useReducedMotion } from "@/lib/useReducedMotion";

import { ChromeN } from "./ChromeN";
import { CursorLamp } from "./CursorLamp";
import { StudioRig } from "./StudioRig";

/**
 * The hero's 3D layer.
 *
 * Rendering is suspended whenever the scene leaves the viewport or the tab
 * goes to the background: `frameloop="demand"` draws once and then does
 * nothing until asked, so scrolling past the hero costs zero GPU for the
 * rest of the page.
 */
export function HeroScene() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [onscreen, setOnscreen] = useState(true);
  const [foregrounded, setForegrounded] = useState(true);
  const reduced = useReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const observer = new IntersectionObserver(
      ([entry]) => setOnscreen(entry?.isIntersecting ?? true),
      { rootMargin: "120px" },
    );
    observer.observe(host);

    const onVisibility = () => setForegrounded(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const running = onscreen && foregrounded && !reduced;

  return (
    <div ref={hostRef} className="absolute inset-0">
      <Canvas
        frameloop={running ? "always" : "demand"}
        // Capped: chrome reflections gain nothing above 1.5 and the cost is
        // quadratic in the ceiling.
        dpr={[1, 1.5]}
        gl={{
          // MSAA over a full-screen canvas to smooth one object's edges is
          // a poor trade; the DPR ceiling already does most of that work.
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        // A long lens. Wide angles make product shots look like snapshots.
        camera={{ position: [0, 0, 8.2], fov: 30, near: 0.1, far: 60 }}
        style={{ pointerEvents: "none" }}
      >
        <Suspense fallback={null}>
          <StudioRig />
          <CursorLamp still={reduced} />
          <ChromeN still={reduced} />
        </Suspense>
      </Canvas>
    </div>
  );
}
