"use client";

import { RollText } from "@/components/paper/RollText";

/**
 * The one primary control. A slab of ink; on hover cobalt rises through it
 * from the bottom edge, like a colour pass on a press, while the label rolls
 * over letter by letter and the arrow steps forward. Square corners, like
 * everything else printed on this page.
 */
export function InkButton({
  children,
  onClick,
  size = "md",
  tone = "ink",
  className = "",
}: {
  children: string;
  onClick?: () => void;
  size?: "sm" | "md";
  /** `paper` is for cobalt grounds, where an ink slab would be too heavy. */
  tone?: "ink" | "paper";
  className?: string;
}) {
  const paper = tone === "paper";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative isolate inline-flex shrink-0 items-center overflow-hidden font-semibold whitespace-nowrap",
        "transition-transform duration-150 active:translate-y-px",
        paper ? "bg-paper text-cobalt" : "bg-ink text-paper",
        size === "sm" ? "h-10 gap-3 px-3.5 text-small sm:px-4" : "h-14 gap-5 px-6 text-copy",
        className,
      ].join(" ")}
    >
      <span
        aria-hidden
        className={`absolute inset-0 -z-10 origin-bottom scale-y-0 transition-transform duration-500 ease-[var(--ease-print)] group-hover:scale-y-100 group-focus-visible:scale-y-100 ${paper ? "bg-ink" : "bg-cobalt"}`}
      />
      <RollText text={children} className={paper ? "group-hover:text-paper transition-colors duration-500" : ""} />
      <svg
        aria-hidden
        viewBox="0 0 20 12"
        className={`${size === "sm" ? "hidden w-4 sm:block" : "w-5"} transition-[transform,color] duration-500 ease-[var(--ease-print)] group-hover:translate-x-1 ${paper ? "group-hover:text-paper" : ""}`}
      >
        <path d="M0 6h18M13 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </button>
  );
}
