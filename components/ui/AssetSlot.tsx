"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { DitherLayer } from "@/components/atmosphere/DitherLayer";

const CORNERS = [
  "top-4 left-4 border-t border-l",
  "top-4 right-4 border-t border-r",
  "bottom-4 left-4 border-b border-l",
  "bottom-4 right-4 border-b border-r",
] as const;

interface AssetSlotProps {
  /** Path under /public. If the file is absent the frame shows its label. */
  src: string;
  /** Optional video that takes over when present. Falls back to `src`. */
  videoSrc?: string;
  /** Printed inside the empty frame: what goes here and at what ratio. */
  label: string;
  alt: string;
  /** CSS aspect-ratio, e.g. "4 / 5". Reserved even while empty, so nothing shifts. */
  ratio?: string;
  /** Ignore the ratio and fill the positioned parent instead. */
  fill?: boolean;
  className?: string;
  /** Hero backgrounds pan slowly; cards do not. */
  kenBurns?: boolean;
  priority?: boolean;
  /**
   * Drawn instead of the empty plate while the file is missing.
   *
   * For frames where we have something better than a dark rectangle to show
   * — a coded UI mock, say. The label still prints over it, so the founder
   * can see what the frame wants; dropping the file replaces both.
   */
  fallback?: ReactNode;
}

/**
 * A picture that has not been taken yet.
 *
 * Dropping a file into `/public` is the *only* step: the slot tries the
 * video, then the image, then falls back to a labelled plate. There is no
 * manifest to update and no flag to flip, because a two-step swap is a
 * two-step swap someone eventually half-does.
 *
 * A plain <img> rather than next/image on purpose — next/image throws for a
 * missing file at build time and cannot be caught at runtime, which is
 * exactly the failure this component exists to absorb.
 *
 * The `onError` prop alone is not enough. The markup is server-rendered, so
 * the browser starts fetching immediately and a 404 usually fires *before*
 * React hydrates and attaches the handler — leaving a broken-image icon
 * forever. The effect below re-checks after mount: an image that is
 * `complete` with zero natural width has already failed, handler or not.
 */
export function AssetSlot({
  src,
  videoSrc,
  label,
  alt,
  ratio = "16 / 9",
  fill = false,
  className = "",
  kenBurns = false,
  priority = false,
  fallback,
}: AssetSlotProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(!videoSrc);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    // Catch failures that happened before hydration.
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setImageFailed(true);

    const video = videoRef.current;
    if (video && video.error) setVideoFailed(true);
  }, [src, videoSrc]);

  const showVideo = Boolean(videoSrc) && !videoFailed;
  const showImage = !showVideo && !imageFailed;

  return (
    <div
      className={`relative overflow-hidden border border-hairline bg-abyss ${fill ? "h-full w-full" : "rounded-[var(--radius-plate)]"} ${className}`}
      style={fill ? undefined : { aspectRatio: ratio }}
    >
      {/* A drawn fallback is content, not a failure state: it renders at
          once, underneath, and a real file simply covers it. Waiting for a
          404 to round-trip before drawing the thing we designed would put
          an empty rectangle on screen for exactly as long as the network
          takes to say no. */}
      {fallback && <div className="absolute inset-0">{fallback}</div>}

      {showVideo && (
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {showImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setImageFailed(true)}
          className={[
            "absolute inset-0 h-full w-full object-cover",
            kenBurns
              ? "motion-safe:animate-[kenBurns_28s_ease-in-out_infinite_alternate]"
              : "",
          ].join(" ")}
        />
      )}

      {!showVideo && imageFailed && (
        <div className="pointer-events-none absolute inset-0">
          {fallback ? (
            // Over a drawn fallback the label needs its own ground, or it
            // sits on whatever the mock happens to put underneath it.
            <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,var(--color-void),transparent)]" />
          ) : (
            <>
              <div className="absolute inset-0 bg-[linear-gradient(155deg,#141924_0%,#0a0d13_58%,#10151f_100%)]" />
              {/* Calmer than the founder portrait's: these plates are large,
                  and a fine checkerboard over 500px reads as noise rather
                  than as texture. Bigger cells, lower opacity. */}
              <DitherLayer
                level={0.34}
                scale={3}
                opacity={0.1}
                className="[mask-image:linear-gradient(to_top,black,transparent_78%)]"
              />
              <div className="absolute inset-0 bg-[radial-gradient(58%_44%_at_50%_28%,rgb(109_92_255/0.14),transparent_72%)]" />
            </>
          )}

          {/* Corner marks, the same drawing language as the case plates.
              Suppressed when the slot is full-bleed: at the page's own
              corners they read as a rendering artifact rather than as a
              frame around something. */}
          {!fill &&
            CORNERS.map((position) => (
              <span
                key={position}
                aria-hidden
                className={`absolute h-4 w-4 border-white/12 ${position}`}
              />
            ))}

          <p className="absolute inset-x-5 bottom-5 font-mono text-[0.625rem] leading-[1.7] tracking-[0.14em] text-ash uppercase">
            {label}
          </p>
        </div>
      )}
    </div>
  );
}
