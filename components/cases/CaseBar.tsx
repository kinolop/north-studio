import Link from "next/link";

import { RollText } from "@/components/paper/RollText";

/**
 * The top edge of a case: the way back to the work on the left, what this
 * page is on the right. Same row as the privacy page's, so every inner page
 * of the site opens the same way.
 */
export function CaseBar({
  back,
  product,
  tag,
  className = "",
}: {
  back: string;
  product: string;
  tag: string;
  className?: string;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-6 border-b border-ink pb-3 ${className}`}>
      <Link href="/#work" className="group mark inline-flex items-center gap-3 text-ink hover:text-cobalt">
        <svg aria-hidden viewBox="0 0 24 10" className="h-[10px] w-6">
          <path
            d="M24 5H3M7 1 3 5l4 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />
        </svg>
        <RollText text={back} />
      </Link>
      <p className="mark text-right text-ink">
        <span className="text-cobalt">{product}</span>
        <span className="text-ink-mute">, {tag}</span>
      </p>
    </div>
  );
}
