import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  children: ReactNode;
  className?: string;
  /** Sections that set their own vertical spacing opt out of the default. */
  flush?: boolean;
}

/** A section of the sheet, and the anchor the header and footer link to. */
export function Section({ id, children, className = "", flush = false }: SectionProps) {
  return (
    <section id={id} className={`relative ${flush ? "" : "py-band"} ${className}`}>
      {children}
    </section>
  );
}
