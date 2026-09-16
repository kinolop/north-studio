import { STUDIO } from "@/lib/studio";

/**
 * The mark: a square of cobalt with the arrow a compass would call north.
 * One shape, drawn at the size of the capital letters beside it, so it can
 * sit in a header, fly across the loader, or run the width of the footer
 * without a second drawing.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`shrink-0 ${className}`}>
      <rect width="24" height="24" fill="var(--color-cobalt)" />
      <path
        d="M12 19V5.6M6.6 11 12 5.6 17.4 11"
        fill="none"
        stroke="var(--color-paper)"
        strokeWidth="2.6"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-[0.32em] leading-none font-extrabold tracking-[-0.035em] whitespace-nowrap ${className}`}
    >
      <LogoMark className="h-[0.86em] w-[0.86em] translate-y-[-0.02em]" />
      <span>{STUDIO.name}</span>
    </span>
  );
}
