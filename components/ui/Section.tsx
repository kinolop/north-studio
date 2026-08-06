import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  children: ReactNode;
  className?: string;
  /** Sections that carry their own top spacing (hero, CTA) opt out. */
  flush?: boolean;
}

/**
 * The only thing that owns vertical rhythm. Sections compose their own
 * grids inside it, but none of them decides its own top and bottom spacing
 * — that is what keeps the page feeling like one document rather than eight
 * stacked pages.
 */
export function Section({ id, children, className = "", flush = false }: SectionProps) {
  return (
    <section
      id={id}
      className={`relative ${flush ? "" : "py-section"} ${className}`}
    >
      {children}
    </section>
  );
}

/**
 * Hairline between sections, brightest at the centre. A hard rule across
 * the full width would cut the page into slabs; this reads as a seam.
 */
export function SectionSeam() {
  return (
    <div
      aria-hidden
      className="container-north"
    >
      <div className="h-px w-full bg-[linear-gradient(90deg,transparent,var(--color-hairline)_18%,var(--color-hairline)_82%,transparent)]" />
    </div>
  );
}
