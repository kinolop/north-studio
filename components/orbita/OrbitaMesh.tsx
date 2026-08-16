"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The living background, drawn in code.
 *
 * Three blooms drifting over a pale gradient, on periods of 38s, 53s and
 * 67s — near-coprime, so the field takes over an hour to return to any
 * arrangement it has already shown. That is what separates this from a
 * looping animation you notice.
 *
 * It depends on no asset. Whatever happens to the image files, every
 * section on this page has a ground that moves.
 *
 * Performance: three composited layers, transform only, no blur filter
 * (a filter across a full-width layer is what makes this technique
 * expensive — the softness lives in the gradients instead). Each mesh
 * pauses the moment its section leaves the viewport, so a long page never
 * animates more than the screenful you are looking at.
 */
type Tone = "rich" | "calm" | "tint";

interface BloomSpec {
  readonly style: React.CSSProperties;
  readonly animation: string;
}

const TONES: Readonly<Record<Tone, readonly BloomSpec[]>> = {
  // Hero and close: the fullest the page gets.
  rich: [
    {
      style: {
        inset: "-24% auto auto -14%",
        width: "78%",
        height: "86%",
        background:
          "radial-gradient(circle at 50% 50%, rgb(16 217 163 / 0.30), rgb(16 217 163 / 0.10) 42%, transparent 68%)",
      },
      animation: "oBloomA 38s ease-in-out infinite",
    },
    {
      style: {
        inset: "-18% -16% auto auto",
        width: "70%",
        height: "80%",
        background:
          "radial-gradient(circle at 50% 50%, rgb(120 244 213 / 0.34), rgb(16 217 163 / 0.08) 46%, transparent 70%)",
      },
      animation: "oBloomB 53s ease-in-out infinite",
    },
    {
      style: {
        inset: "auto auto -30% 18%",
        width: "82%",
        height: "72%",
        background:
          "radial-gradient(circle at 50% 50%, rgb(214 224 236 / 0.55), rgb(214 224 236 / 0.16) 44%, transparent 70%)",
      },
      animation: "oBloomC 67s ease-in-out infinite",
    },
  ],

  // Content sections: present, but never competing with the type.
  calm: [
    {
      style: {
        inset: "-20% auto auto -10%",
        width: "66%",
        height: "76%",
        background:
          "radial-gradient(circle at 50% 50%, rgb(16 217 163 / 0.15), transparent 66%)",
      },
      animation: "oBloomA 44s ease-in-out infinite",
    },
    {
      style: {
        inset: "auto -14% -24% auto",
        width: "64%",
        height: "72%",
        background:
          "radial-gradient(circle at 50% 50%, rgb(16 217 163 / 0.10), transparent 68%)",
      },
      animation: "oBloomB 59s ease-in-out infinite",
    },
    {
      style: {
        inset: "auto auto -18% 24%",
        width: "70%",
        height: "60%",
        background:
          "radial-gradient(circle at 50% 50%, rgb(214 224 236 / 0.42), transparent 70%)",
      },
      animation: "oBloomC 71s ease-in-out infinite",
    },
  ],

  // Security: mint-forward, so the section reads as its own place.
  tint: [
    {
      style: {
        inset: "-16% auto auto -8%",
        width: "72%",
        height: "84%",
        background:
          "radial-gradient(circle at 50% 50%, rgb(16 217 163 / 0.26), rgb(16 217 163 / 0.09) 44%, transparent 70%)",
      },
      animation: "oBloomA 41s ease-in-out infinite",
    },
    {
      style: {
        inset: "auto -12% -22% auto",
        width: "76%",
        height: "80%",
        background:
          "radial-gradient(circle at 50% 50%, rgb(120 244 213 / 0.30), transparent 68%)",
      },
      animation: "oBloomB 56s ease-in-out infinite",
    },
    {
      style: {
        inset: "auto auto -26% 30%",
        width: "64%",
        height: "64%",
        background:
          "radial-gradient(circle at 50% 50%, rgb(214 224 236 / 0.34), transparent 70%)",
      },
      animation: "oBloomC 63s ease-in-out infinite",
    },
  ],
};

export function OrbitaMesh({
  tone = "calm",
  /** Phase offset in seconds. Two sections on the same tone would
   *  otherwise drift in lockstep and read as one repeated panel. */
  seed = 0,
}: {
  tone?: Tone;
  seed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setLive(entry?.isIntersecting ?? true),
      { rootMargin: "120px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      data-mesh={live ? "running" : "held"}
      className="o-mesh-root"
    >
      {TONES[tone].map((bloom, index) => (
        <span
          key={index}
          className="o-bloom"
          style={{
            ...bloom.style,
            animation: bloom.animation,
            animationDelay: `-${seed * 6 + index * 4}s`,
          }}
        />
      ))}
      <div className="o-grain" />
    </div>
  );
}
