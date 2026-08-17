"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";

interface HeroVideoProps {
  /** Path under /public. */
  src: string;
  /** Full-resolution still of this video's own first frame. */
  poster: string;
}

/**
 * A hero's full-bleed moving background.
 *
 * The poster is frame zero of the file it sits under, so the handover from
 * still to motion has nothing to jump: the first pixel painted and the
 * first pixel played are the same picture.
 *
 * Reduced motion is answered by not shipping the video at all — the still
 * renders in its place, which is both the accessible reading of the
 * preference and several megabytes the visitor never pays for.
 * `useReducedMotion` reports false on the server, so the markup starts as
 * the video and corrects on hydrate; dropping the element cancels a load
 * already in flight.
 *
 * Nothing here blurs, scales or drifts the picture — a hero background
 * that quietly zooms is a hero background that is never in focus. The
 * scrim is a separate, side-weighted layer so the type gets its ground
 * without the whole frame paying for it.
 */
export function HeroVideo({ src, poster }: HeroVideoProps) {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced) return;
    // Autoplay can still be refused after mount — data saver, low battery.
    // Nothing to repair if it is: the poster is already the right picture.
    void video.play().catch(() => {});
  }, [reduced]);

  const still = reduced || failed;

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {still ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Strong under the words and clearing across the frame, so the
          picture still reads as a picture. Below the breakpoint the type
          sits over the middle of the frame, so the scrim turns vertical to
          follow it — the same rule the ORBITA hero follows.

          The wide stops are held to the end of the type column (~56%) and
          then dropped hard rather than eased away. Measured, not guessed:
          a gentler falloff put the headline's last line over the mascot's
          own glow at 2.8:1. Holding to 56% and clearing by 68% keeps the
          words at AA and still hands the centre of the frame back to the
          picture. */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(7_8_11/0.9)_0%,rgb(7_8_11/0.78)_45%,rgb(7_8_11/0.82)_100%)] lg:bg-[linear-gradient(100deg,rgb(7_8_11/0.94)_0%,rgb(7_8_11/0.88)_40%,rgb(7_8_11/0.74)_56%,rgb(7_8_11/0.34)_68%,rgb(7_8_11/0.12)_82%,rgb(7_8_11/0.04)_100%)]" />

      {/* Edge blend: the section should end, not be cut off, where the
          page's own near-black takes over. */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(to_top,var(--color-void),transparent)]" />
    </div>
  );
}
