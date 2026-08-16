"use client";

import { useEffect, useRef, useState } from "react";

import { useOrbitaParallax } from "./useOrbitaParallax";

/**
 * A section's ground.
 *
 * An image if one was supplied, the coded mint-and-neutral mesh if it was
 * not — the page never shows a bare white void where a backdrop belongs.
 * Either way a scrim sits on top, because everything that matters on this
 * page is the type in front of it.
 */
export function OrbitaBackdrop({
  src,
  /** How hard the scrim works. Sections with dense type ask for more. */
  scrim = "soft",
  strength = 26,
}: {
  src?: string;
  scrim?: "soft" | "medium" | "veil";
  strength?: number;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(!src);

  useOrbitaParallax(imageRef, strength);

  useEffect(() => {
    const image = imageRef.current;
    if (image && image.complete && image.naturalWidth === 0) setFailed(true);
  }, [src]);

  const wash =
    scrim === "veil"
      ? "linear-gradient(180deg, rgb(255 255 255 / 0.90), rgb(255 255 255 / 0.82))"
      : scrim === "medium"
        ? "linear-gradient(180deg, rgb(255 255 255 / 0.80), rgb(247 248 250 / 0.70))"
        : "linear-gradient(180deg, rgb(255 255 255 / 0.62), rgb(247 248 250 / 0.55))";

  return (
    <div aria-hidden className="o-bg">
      {failed || !src ? (
        <div className="o-mesh" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imageRef}
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
      <div className="o-bg-scrim" style={{ background: wash }} />
    </div>
  );
}
