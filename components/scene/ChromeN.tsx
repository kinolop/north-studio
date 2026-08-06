"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { subscribePointer } from "@/lib/pointer";

import { createNGeometry } from "./nGlyph";

interface ChromeNProps {
  /** Idle motion off, pointer response off, one composed pose. */
  still: boolean;
}

/** Height of the glyph in local units — see nGlyph. */
const GLYPH_HEIGHT = 3.2;

/**
 * Placement differs by orientation, because the relationship to the
 * headline does. On a wide screen the type runs beside the object and can
 * cross its lower half. In portrait the type runs straight through the
 * middle of it, so the object moves up and gets smaller — a bright chrome
 * highlight behind a headline is a contrast failure, not a composition.
 */
function frameTheGlyph(width: number, height: number) {
  const portrait = width / height < 0.8;
  const heightShare = portrait ? 0.26 : 0.46;

  return {
    scale: Math.min(
      (height * heightShare) / GLYPH_HEIGHT,
      (width * 0.62) / 2.4,
    ),
    restY: portrait ? height * 0.26 : 0.72,
    // In portrait it also moves off the left margin, which is where the
    // eyebrow and the headline both start.
    restX: portrait ? width * 0.15 : 0,
  };
}

/** Frame-rate independent exponential damping. Higher lambda settles faster. */
function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

/**
 * Mechanic 1 — the hero object.
 *
 * MeshPhysicalMaterial with metalness 1, not MeshTransmissionMaterial:
 * transmission models glass, and this is meant to be a machined billet with
 * weight to it. Almost everything you see on the surface is the environment
 * being reflected, so the lighting rig does more work here than the shader.
 */
export function ChromeN({ still }: ChromeNProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { scene, viewport } = useThree();

  // Framed against the viewport rather than fixed, so the composition holds
  // from a phone to an ultrawide instead of only at the width it was tuned on.
  const { scale, restY, restX } = frameTheGlyph(viewport.width, viewport.height);
  const restYRef = useRef(restY);
  restYRef.current = restY;

  const geometry = useMemo(() => createNGeometry(), []);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        // Chrome is never white — it is a cool grey that borrows its
        // brightness from whatever it is standing in.
        // Chrome is never white — it is a cool grey that borrows its
        // brightness from whatever it is standing in. Lifted from the first
        // pass because the N was reading closer to graphite than to metal.
        color: new THREE.Color("#c6cad4"),
        metalness: 1,
        // Tighter than before: roughness is what separates polished chrome
        // from brushed steel, and every 0.01 here is visible on the bevels.
        roughness: 0.06,
        // The single biggest lever on how alive the object looks. The rig
        // is authored, so pushing this is pushing our own lightformers,
        // not blowing out someone else's HDRI.
        envMapIntensity: 3.4,
        // Clearcoat is a whole second BRDF lobe evaluated per fragment, and
        // on a metal this dark it was buying very little over simply
        // dropping the roughness. Removed for the frames; the specular below
        // is tightened to compensate.
        // Brushed direction along the extrusion, kept subtle — enough to
        // stretch highlights slightly rather than to read as a texture.
        anisotropy: 0.4,
        anisotropyRotation: Math.PI / 4,
      }),
    [],
  );

  // three holds GPU resources until told otherwise.
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  const pointer = useRef({ nx: 0, ny: 0 });
  useEffect(() => subscribePointer((s) => {
    pointer.current.nx = s.nx;
    pointer.current.ny = s.ny;
  }), []);

  const envRotation = useRef(new THREE.Euler(0, 0, 0));

  useEffect(() => {
    if (!still) return;
    // Reduced motion: one deliberate three-quarter pose, held.
    const mesh = meshRef.current;
    if (mesh) {
      mesh.rotation.set(-0.16, -0.42, 0.03);
      mesh.position.y = restYRef.current;
    }
    scene.environmentRotation = new THREE.Euler(0, 0.35, 0);
  }, [still, scene]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh || still) return;

    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const { nx, ny } = pointer.current;

    // Idle: two slow, incommensurable oscillations so the object never
    // appears to return to a start position.
    const idleY = Math.sin(t * 0.19) * 0.2 + Math.sin(t * 0.071) * 0.09;
    const idleX = Math.sin(t * 0.134) * 0.085;

    // The N leans into the cursor rather than tracking it — the pointer
    // suggests, the object decides.
    mesh.rotation.y = damp(mesh.rotation.y, idleY + nx * 0.34, 2.4, dt);
    mesh.rotation.x = damp(mesh.rotation.x, idleX - ny * 0.26, 2.4, dt);
    mesh.rotation.z = damp(mesh.rotation.z, nx * 0.045, 1.8, dt);
    mesh.position.y = damp(
      mesh.position.y,
      restYRef.current + Math.sin(t * 0.37) * 0.055,
      3,
      dt,
    );

    // Mechanic 2 on metal: rotating the environment sweeps every reflection
    // across the surface at once. A moving light source alone would only
    // move one highlight; this moves the whole room the object stands in,
    // and costs nothing because the cubemap is never re-rendered.
    // Widened from 0.85: the sweep is the clearest proof the cursor is a
    // light, so it earns more travel than the object's own lean.
    const env = envRotation.current;
    env.y = damp(env.y, nx * 1.25, 2, dt);
    env.x = damp(env.x, ny * 0.6, 2, dt);
    scene.environmentRotation = env;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      scale={scale}
      position-x={restX}
      position-y={restY}
      castShadow={false}
      receiveShadow={false}
    />
  );
}
