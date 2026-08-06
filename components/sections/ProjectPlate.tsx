import Image from "next/image";

import { DitherLayer } from "@/components/atmosphere/DitherLayer";
import type { ProjectCopy } from "@/lib/i18n/types";
import { PROJECT_IMAGES } from "@/lib/studio";

/**
 * The visual for a case card.
 *
 * With no capture available this draws a plate in the studio's own
 * language — a machinist's drawing of the piece: crop marks at the corners,
 * a dimension rule, a technical grid and the monogram sitting on it like a
 * part on a bench. It reads as an intentional abstract rather than a grey
 * box, which is what a placeholder should do: hold the composition honestly
 * until the real work replaces it.
 *
 * Add the project's key to PROJECT_IMAGES in lib/studio.ts and this renders
 * the capture instead, with no other change required.
 */
export function ProjectPlate({ project }: { project: ProjectCopy }) {
  const image = PROJECT_IMAGES[project.key];

  if (image) {
    return (
      <Image
        src={image}
        alt={`${project.name} — ${project.discipline}`}
        fill
        sizes="(max-width: 1024px) 100vw, 55vw"
        className="object-cover transition-transform duration-[900ms] ease-[var(--ease-north)] group-hover:scale-[1.045]"
      />
    );
  }

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(150deg,#12161e_0%,#0a0d13_55%,#0e131c_100%)]" />

      {/* Technical grid — the drawing the object was machined from. */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / 0.032) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.032) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <DitherLayer level={0.28} scale={2} opacity={0.1} />

      <div className="absolute inset-0 bg-[radial-gradient(58%_62%_at_74%_16%,rgb(109_92_255/0.20),transparent_70%)]" />

      {/* The part on the bench, and the sweep that moves across it. */}
      <div className="absolute inset-0 transition-transform duration-[900ms] ease-[var(--ease-north)] group-hover:scale-[1.04]">
        <span className="text-chrome absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[clamp(5rem,12vw,10rem)] leading-none font-semibold opacity-[0.13] [font-variation-settings:'wdth'_122]">
          {project.name.charAt(0)}
        </span>
      </div>

      {/* Crop marks. Four corners, hairline, nothing else. */}
      {(
        [
          "top-5 left-5 border-t border-l",
          "top-5 right-5 border-t border-r",
          "bottom-5 left-5 border-b border-l",
          "bottom-5 right-5 border-b border-r",
        ] as const
      ).map((position) => (
        <span
          key={position}
          className={`absolute h-4 w-4 border-white/12 ${position}`}
        />
      ))}

      {/* Dimension rule along the foot — the plate is a drawing, so it is
          dimensioned. */}
      <div className="absolute right-5 bottom-5 left-5 flex items-center gap-3">
        <span className="h-2 w-px bg-white/15" />
        <span className="h-px flex-1 bg-white/10" />
        <span className="font-mono text-[0.5625rem] tracking-[0.22em] text-white/25 uppercase">
          {project.name}
        </span>
        <span className="h-px flex-1 bg-white/10" />
        <span className="h-2 w-px bg-white/15" />
      </div>

      {/* Specular sweep, parked off-plate until hover. */}
      <div className="absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_38%,rgb(236_237_239/0.10)_50%,transparent_62%)] transition-transform duration-[1200ms] ease-[var(--ease-north)] group-hover:translate-x-full" />
    </div>
  );
}
