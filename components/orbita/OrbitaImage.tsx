"use client";

import { useEffect, useRef, useState } from "react";

/**
 * An ORBITA image, and a light stand-in when the file is not there.
 *
 * The studio's AssetSlot falls back to a near-black plate with a mono build
 * label — correct there, wrong here: a dark rectangle in the middle of an
 * off-white page reads as a bug. This one falls back to a soft neutral card
 * with a mint mark and a quiet caption, so a missing file still looks like
 * part of the product.
 *
 * A plain <img> rather than next/image, for the same reason the studio uses
 * one: next/image throws at build time for a missing file and cannot be
 * caught at runtime, which is precisely the failure this absorbs. The effect
 * re-checks after mount because a 404 usually lands before React hydrates.
 */
export function OrbitaImage({
  src,
  alt,
  label,
  ratio = "16 / 10",
  drift = false,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  /** Printed in the stand-in: what belongs here. */
  label: string;
  ratio?: string;
  drift?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const image = ref.current;
    if (image && image.complete && image.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (failed) {
    return (
      <div
        className={`o-ph flex flex-col items-center justify-center gap-3 ${className}`}
        style={{
          aspectRatio: ratio,
          background: "linear-gradient(170deg, #ffffff 0%, var(--o-tint) 100%)",
          border: "1px solid var(--o-line)",
          borderRadius: "inherit",
        }}
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7">
          <circle
            cx="12"
            cy="12"
            r="8.6"
            fill="none"
            stroke="var(--o-accent)"
            strokeWidth="2.1"
            opacity="0.34"
          />
          <circle cx="12" cy="12" r="4.4" fill="var(--o-accent)" />
        </svg>
        <p
          className="o-small px-6 text-center"
          style={{ color: "var(--o-muted)" }}
        >
          {label}
        </p>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={`${drift ? "o-drift" : ""} ${className}`}
      style={{ aspectRatio: ratio, objectFit: "cover", width: "100%" }}
    />
  );
}
