"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type * as THREE from "three";

import { subscribePointer } from "@/lib/pointer";

/** How far to either side of centre the lamp may travel, in world units. */
const REACH_X = 7;
const REACH_Y = 4.2;

/**
 * Mechanic 2 in the 3D scene — the pointer as an actual light.
 *
 * The rotating environment (see ChromeN) sweeps the broad reflections; this
 * adds the hard, moving specular hotspot on top of them. Both are needed:
 * the sweep gives the metal its sense of standing in a room, the hotspot
 * gives the cursor something to obviously be doing.
 */
export function CursorLamp({ still }: { still: boolean }) {
  const lampRef = useRef<THREE.PointLight>(null);
  const target = useRef({ x: 2.6, y: 1.6 });

  useEffect(() => subscribePointer((s) => {
    target.current.x = s.nx * REACH_X;
    target.current.y = s.ny * REACH_Y;
  }), []);

  useFrame((_, delta) => {
    const lamp = lampRef.current;
    if (!lamp || still) return;

    const k = 1 - Math.exp(-4 * Math.min(delta, 0.05));
    lamp.position.x += (target.current.x - lamp.position.x) * k;
    lamp.position.y += (target.current.y - lamp.position.y) * k;
  });

  return (
    <pointLight
      ref={lampRef}
      position={[2.6, 1.6, 5.5]}
      intensity={still ? 34 : 46}
      distance={26}
      decay={2}
      color="#cfd6ff"
    />
  );
}
