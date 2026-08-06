"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * The lighting rig, built entirely from lightformers.
 *
 * Deliberately not an HDRI preset: drei's presets fetch a several-megabyte
 * environment map from a CDN, which means a network dependency, a loading
 * state, and someone else's studio. These lightformers are rendered to a
 * 256px cubemap once, on device, at essentially no cost — and because we
 * author them, we control exactly where every highlight on the N lands.
 *
 * It is a real product-photography setup: a broad softbox overhead for the
 * body of the reflection, two narrow strips either side for the long
 * specular streaks that read as machined, a rim behind to separate the
 * object from the dark, and one violet card that is the only colour the
 * metal ever picks up.
 */
export function StudioRig() {
  return (
    <>
      {/* Enough ambient to keep the unlit faces from going to pure black. */}
      <ambientLight intensity={0.34} color="#8e97ad" />

      <Environment resolution={256} frames={1}>
        {/* Overhead softbox — the primary broad highlight. */}
        <Lightformer
          form="rect"
          intensity={3.4}
          color="#ffffff"
          position={[0, 5, 1.5]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[9, 5, 1]}
        />

        {/* Narrow side strips. These are what draw the long, sharp lines
            down the bevels; widening them turns the object to plastic. */}
        <Lightformer
          form="rect"
          intensity={5.2}
          color="#dfe6ff"
          position={[-5, 0.5, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[6, 0.42, 1]}
        />
        <Lightformer
          form="rect"
          intensity={4.4}
          color="#ffffff"
          position={[5, -0.5, 1.5]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[6, 0.3, 1]}
        />

        {/* Rim from behind, separating the silhouette from the fog. */}
        <Lightformer
          form="rect"
          intensity={2.6}
          color="#aeb8d4"
          position={[2.5, 1.5, -5]}
          rotation={[0, Math.PI, 0]}
          scale={[5, 3, 1]}
        />

        {/* The single accent. The one place brand colour touches the metal. */}
        <Lightformer
          form="circle"
          intensity={3.1}
          color="#6d5cff"
          position={[-3.2, -2.6, -2.4]}
          scale={[3.4, 3.4, 1]}
        />

        {/* Camera-side fill — the piece the first pass was missing.
            A metal standing in an otherwise dark room reflects darkness back
            at the viewer and reads as a silhouette. This broad, dim card
            sits where the camera is, so every face angled toward the viewer
            keeps information instead of falling to black. The value matters
            more than the idea: at 1.5 this washed the whole object into pale
            silver plastic and lost the drama entirely. It wants to be barely
            present — just enough that the shadow side is dark metal rather
            than a hole. */}
        <Lightformer
          form="rect"
          intensity={0.38}
          color="#4a5570"
          position={[0, 0.5, 7]}
          scale={[7, 6, 1]}
        />

        {/* Deep fill so the lower half of the object still has information. */}
        <Lightformer
          form="rect"
          intensity={1.15}
          color="#39415c"
          position={[0, -5, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[10, 10, 1]}
        />
      </Environment>
    </>
  );
}
