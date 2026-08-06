import type { Bearing } from "@/lib/sections";

interface EyebrowProps {
  bearing: Bearing;
  label: string;
  className?: string;
}

/**
 * The section marker.
 *
 * Not `01 / 02 / 03` — the studio is called North, so sections carry a
 * compass heading and the page is a single descending bearing. The number
 * encodes real position in the narrative, which the compass HUD reads back.
 */
export function Eyebrow({ bearing, label, className = "" }: EyebrowProps) {
  return (
    <p className={`label-mono flex items-center gap-3 ${className}`}>
      <span
        aria-hidden
        className="inline-block h-1 w-1 rounded-full bg-signal shadow-[0_0_10px_2px_rgb(109_92_255/0.6)]"
      />
      <span className="text-signal-lift">{bearing}</span>
      <span aria-hidden className="h-px w-6 bg-hairline" />
      <span>{label}</span>
    </p>
  );
}
