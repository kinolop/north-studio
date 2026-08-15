"use client";

import { useCopy } from "@/components/i18n/CopyProvider";

/**
 * The brand's object: three bodies on three rings, and a lit core.
 *
 * Each ring carries a fixed rotation of its own, and the spinning layer sits
 * *inside* it. That is what makes the still frame work — with motion
 * reduced, every satellite parks at its ring's offset instead of all three
 * snapping to twelve o'clock in a row.
 *
 * Transform and opacity only, three elements moving: it costs a compositor
 * layer each and nothing on the main thread.
 */
const RINGS = [
  {
    key: "outer",
    inset: "2%",
    turn: -28,
    size: "0.5rem",
    ring: "border-orbita/20",
    // Written out rather than composed: Tailwind reads the source as text,
    // and a class name assembled at runtime is a class name it never emits.
    spin: "motion-safe:animate-[orbitSpin_31s_linear_infinite]",
  },
  {
    key: "middle",
    inset: "14%",
    turn: 116,
    size: "0.4rem",
    ring: "border-dashed border-orbita/25",
    spin: "motion-safe:animate-[orbitSpinBack_22s_linear_infinite]",
  },
  {
    key: "inner",
    inset: "32%",
    turn: 208,
    size: "0.35rem",
    ring: "border-orbita/20",
    spin: "motion-safe:animate-[orbitSpin_15s_linear_infinite]",
  },
] as const;

export function OrbitaOrbit() {
  const copy = useCopy();
  const mock = copy.orbitaCase.product.mock;

  return (
    <div className="relative aspect-square w-full">
      <div
        aria-hidden
        className="absolute inset-[22%] rounded-full bg-[radial-gradient(circle,rgb(78_201_220/0.22),transparent_68%)] motion-safe:animate-[orbitGlow_9s_ease-in-out_infinite]"
      />

      {RINGS.map((ring) => (
        <div
          key={ring.key}
          aria-hidden
          style={{ inset: ring.inset, transform: `rotate(${ring.turn}deg)` }}
          className="absolute"
        >
          <div className={`absolute inset-0 rounded-full border ${ring.ring}`} />
          <div className={`absolute inset-0 ${ring.spin}`}>
            <span
              style={{ width: ring.size, height: ring.size }}
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orbita shadow-[0_0_16px_4px_rgb(78_201_220/0.45)]"
            />
          </div>
        </div>
      ))}

      {/* The core. The mark's centre dot, at hero scale. */}
      <span
        aria-hidden
        className="absolute top-1/2 left-1/2 h-[7%] w-[7%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-bone),var(--color-orbita)_55%,rgb(13_58_68/0.9))] shadow-[0_0_44px_10px_rgb(78_201_220/0.35)]"
      />

      {/* The product's one number, laid over its own diagram. */}
      <div className="absolute inset-x-[4%] bottom-[4%] rounded-[var(--radius-plate)] border border-orbita/25 bg-[linear-gradient(180deg,rgb(13_58_68/0.55),rgb(7_8_11/0.92))] px-5 py-4 backdrop-blur-[2px]">
        <p className="label-mono text-orbita/70">{mock.totalLabel}</p>
        <p className="mt-2.5 font-display text-[clamp(1.4rem,2.6vw,1.9rem)] leading-none font-semibold tracking-[-0.03em] tabular-nums text-bone [font-variation-settings:'wdth'_92]">
          {mock.total}
        </p>
      </div>
    </div>
  );
}
