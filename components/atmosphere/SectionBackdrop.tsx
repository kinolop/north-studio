import type { ReactNode } from "react";

import { AssetSlot } from "@/components/ui/AssetSlot";

import { DitherLayer } from "./DitherLayer";

/**
 * Light that belongs to a section rather than to the viewport.
 *
 * `Atmosphere` lights the whole page, but it is `fixed`: it stays put while
 * the page moves, so the gradient anchored near the top of the screen never
 * reaches the middle of a long page. The result was cases whose hero looked
 * lit and whose every following section fell back to flat near-black — the
 * single clearest tell of a template.
 *
 * This is the fix, and its whole design is restraint:
 *
 *   • Gradients, not a shader. A radial gradient translated on the
 *     compositor costs a fraction of a noise pass and, at these opacities,
 *     looks the same.
 *   • Contrast first, and arithmetic rather than taste. Peak accent alpha
 *     is 0.13, in the hero, underneath its own grading layer. The brightest
 *     point any body text actually sits on is 0.10 plus the dither's
 *     average lift, where --color-ash holds 7.1:1 and --color-slate 4.7:1.
 *     The dither is white: it is the layer that quietly eats the margin, so
 *     it is kept under 0.04 and masked away from the edges.
 *   • Every backdrop fades to --color-void at its own top and bottom, so a
 *     lit section melts into an unlit one instead of showing a rectangle.
 *   • Alternate, never stack. The page reads hero → machine → faint →
 *     close; the sections between them stay dark on purpose, because
 *     everything glowing is the same as nothing glowing.
 */

type Tone = "hero" | "machine" | "faint" | "close";

interface ToneSpec {
  /** The section's own key light. */
  readonly wash: string;
  /** Two drifting volumes. The second is a cool grey lift, never a second accent. */
  readonly blobA: string;
  readonly blobB: string;
  readonly dither: number;
  /** A single faint chrome pass, for the sections that should read machined. */
  readonly sheen?: boolean;
}

const TONES: Readonly<Record<Tone, ToneSpec>> = {
  hero: {
    wash: "bg-[radial-gradient(118%_82%_at_76%_6%,rgb(109_92_255/0.13),transparent_62%)]",
    blobA:
      "top-[-24%] left-[-18%] h-[80%] w-[74%] bg-[radial-gradient(circle,rgb(109_92_255/0.10),transparent_68%)]",
    blobB:
      "right-[-16%] bottom-[-28%] h-[74%] w-[68%] bg-[radial-gradient(circle,rgb(22_27_40/0.85),transparent_70%)]",
    dither: 0.04,
  },
  machine: {
    wash: "bg-[radial-gradient(104%_74%_at_16%_2%,rgb(109_92_255/0.10),transparent_60%)]",
    blobA:
      "top-[-14%] right-[-20%] h-[84%] w-[72%] bg-[radial-gradient(circle,rgb(109_92_255/0.09),transparent_70%)]",
    blobB:
      "bottom-[-26%] left-[-16%] h-[76%] w-[66%] bg-[radial-gradient(circle,rgb(20_26_38/0.9),transparent_72%)]",
    dither: 0.04,
    sheen: true,
  },
  faint: {
    wash: "bg-[radial-gradient(96%_66%_at_50%_0%,rgb(109_92_255/0.06),transparent_58%)]",
    blobA:
      "top-[-20%] left-[-12%] h-[70%] w-[62%] bg-[radial-gradient(circle,rgb(109_92_255/0.05),transparent_72%)]",
    blobB:
      "right-[-18%] bottom-[-22%] h-[66%] w-[60%] bg-[radial-gradient(circle,rgb(18_22_33/0.8),transparent_74%)]",
    dither: 0.03,
  },
  close: {
    wash: "bg-[radial-gradient(110%_78%_at_50%_104%,rgb(109_92_255/0.10),transparent_64%)]",
    blobA:
      "bottom-[-30%] left-[-14%] h-[80%] w-[70%] bg-[radial-gradient(circle,rgb(109_92_255/0.08),transparent_70%)]",
    blobB:
      "top-[-22%] right-[-16%] h-[72%] w-[64%] bg-[radial-gradient(circle,rgb(20_25_37/0.85),transparent_72%)]",
    dither: 0.04,
  },
};

/**
 * The coded backdrop on its own.
 *
 * Also what every image slot on these pages falls back to, which is the
 * point: a section with no file dropped into it should look lit and
 * finished, not like a hole waiting for artwork.
 */
export function CodedBackdrop({
  tone = "machine",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  const spec = TONES[tone];

  return (
    <div aria-hidden className={`absolute inset-0 overflow-hidden ${className}`}>
      <div className={`absolute inset-0 ${spec.wash}`} />

      <div
        className={`absolute rounded-full motion-safe:animate-[driftA_54s_ease-in-out_infinite] ${spec.blobA}`}
      />
      <div
        className={`absolute rounded-full motion-safe:animate-[driftB_71s_ease-in-out_infinite] ${spec.blobB}`}
      />

      {spec.sheen && (
        <div className="absolute inset-0 bg-[linear-gradient(104deg,transparent_36%,rgb(236_237_239/0.028)_50%,transparent_64%)]" />
      )}

      {/* The site's own dither, so this reads as the same surface as the
          case plates rather than as a new effect. It also kills the banding
          a near-black gradient produces on an 8-bit display. */}
      <DitherLayer
        level={0.3}
        scale={3}
        opacity={spec.dither}
        className="[mask-image:radial-gradient(80%_70%_at_50%_40%,black,transparent_78%)]"
      />

      {/* Legibility, and the seam. Fading to void at both edges is what
          keeps a lit section from showing its own rectangle against the
          unlit ones above and below it. */}
      <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,var(--color-void),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,var(--color-void),transparent)]" />
    </div>
  );
}

interface SectionBackdropProps {
  tone?: Tone;
  /**
   * An optional richer plate. Absent — which is the normal state — the
   * coded backdrop above stands in and the section still looks finished.
   */
  src?: string;
  videoSrc?: string;
  label?: string;
  /** Extra grading over the image, where a section needs its text darker. */
  scrim?: ReactNode;
  className?: string;
}

/**
 * A section's backdrop: the coded one, or an image the founder dropped in.
 *
 * Sits at `-z-10` inside its section, which is where `GhostWord` already
 * lives — behind the content, in front of the fixed atmosphere.
 */
export function SectionBackdrop({
  tone = "machine",
  src,
  videoSrc,
  label,
  scrim,
  className = "",
}: SectionBackdropProps) {
  if (!src) {
    return <CodedBackdrop tone={tone} className={`-z-10 ${className}`} />;
  }

  return (
    <div aria-hidden className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <AssetSlot
        src={src}
        videoSrc={videoSrc}
        label={label ?? ""}
        alt=""
        fill
        kenBurns
        className="border-0"
        fallback={<CodedBackdrop tone={tone} />}
      />
      {scrim ?? (
        <>
          {/* Graded hard, and deliberately not trusting the file: the plate
              behind this carries type, and a founder's render that arrives
              two stops brighter than expected must not be able to cost the
              page its contrast. */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(7_8_11/0.80),rgb(7_8_11/0.88))]" />
          <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,var(--color-void),transparent)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,var(--color-void),transparent)]" />
        </>
      )}
    </div>
  );
}
