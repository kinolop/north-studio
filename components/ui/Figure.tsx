"use client";

import { useRef } from "react";

import { useLocale } from "@/components/i18n/CopyProvider";
import { formatNumber } from "@/lib/format";
import type { FigureCopy } from "@/lib/i18n/types";
import { useCountUp } from "@/lib/useCountUp";

interface FigureProps {
  item: FigureCopy;
  /** Milliseconds, for staggering a row of them. */
  delay?: number;
  /** Every visual decision belongs to the caller: three pages print these
   *  and only one of them is allowed to look like the studio. */
  className?: string;
}

/**
 * A number that counts up once, punctuated for the reader's language.
 *
 * `literal` figures — "24/7", "AES-256" — pass straight through: they are
 * not quantities, and counting to them is meaningless.
 */
export function Figure({ item, delay = 0, className = "" }: FigureProps) {
  const { locale } = useLocale();
  const hostRef = useRef<HTMLParagraphElement>(null);
  const decimals = item.decimals ?? 0;

  const shown = useCountUp(item.value ?? 0, hostRef, {
    delay,
    decimals,
    enabled: item.value !== null && !item.literal,
  });

  return (
    <p ref={hostRef} className={className}>
      {item.literal ?? `${formatNumber(shown, locale, decimals)}${item.suffix}`}
    </p>
  );
}
