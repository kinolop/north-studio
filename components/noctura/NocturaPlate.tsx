"use client";

import Image from "next/image";
import { useState } from "react";

import { useNocturaParallax } from "./useNocturaParallax";

interface NocturaPlateProps {
  src: string;
  alt: string;
  /** Printed in the stand-in if the file never arrives. */
  slot: string;
  sizes: string;
  /** CSS aspect-ratio for the frame, e.g. "16 / 10". */
  ratio?: string;
  /** Parallax travel in px. 0 turns it off for plates that must sit still. */
  parallax?: number;
  /** Above-the-fold plates should not wait for the lazy loader. */
  priority?: boolean;
  className?: string;
  /** Scrims, captions - anything that has to sit over the picture. */
  children?: React.ReactNode;
}

/**
 * One photograph, seated into the page.
 *
 * Three things happen here that a bare `<Image>` would not do:
 *
 *   1. The picture is over-tall inside a clipping frame and drifts on
 *      scroll, so it moves against the page instead of with it.
 *   2. It is dimmed a touch below the file's own exposure. These renders
 *      are lit for their own frame, not for a page with a dark ground under
 *      them, and at full brightness they glare against the ambience.
 *   3. A missing file falls back to an on-theme stand-in that names the
 *      expected filename - never a broken image, never a dead block.
 */
export function NocturaPlate({
  src,
  alt,
  slot,
  sizes,
  ratio = "16 / 10",
  parallax = 28,
  priority = false,
  className = "",
  children,
}: NocturaPlateProps) {
  const [failed, setFailed] = useState(false);
  const drift = useNocturaParallax<HTMLDivElement>(parallax);

  return (
    <div className={`n-plate ${className}`} style={{ aspectRatio: ratio }}>
      {failed ? (
        <div className="n-slot">
          <p className="n-label">Изображение</p>
          <p className="n-small" style={{ color: "var(--n-smoke)" }}>
            {slot}
          </p>
        </div>
      ) : (
        // Over-tall and inset, so the parallax travel never exposes an edge.
        <div
          ref={parallax > 0 ? drift : undefined}
          style={{ position: "absolute", inset: "-6% 0", height: "112%" }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            onError={() => setFailed(true)}
            style={{ objectFit: "cover" }}
          />
        </div>
      )}

      {children}
    </div>
  );
}
