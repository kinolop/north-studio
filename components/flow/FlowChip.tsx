"use client";

import type { FlowLead } from "@/lib/i18n/types";

interface FlowChipProps {
  lead: FlowLead;
  card: number;
  filedLabel: string;
  /** Running: this slot's phase offset, in ms. Negative — see FlowConveyor. */
  delay?: number;
  /** Held still: which station this chip is parked at, 0–3. */
  station?: number;
}

/**
 * A lead, riding the line.
 *
 * The chip is a form being filled in as it travels: the channel is known at
 * the intake, the tag is written at qualification, the routing at the
 * manager, the card number when it is filed. Every one of those lines is in
 * the DOM from the start and only fades in, so the chip never changes size
 * and nothing on the line jitters as it moves.
 *
 * With motion reduced the same component parks at a station and shows
 * exactly what it would have earned by that point — the animation's own
 * frames, read as a diagram instead of watched as a machine.
 */
export function FlowChip({
  lead,
  card,
  filedLabel,
  delay = 0,
  station,
}: FlowChipProps) {
  const running = station === undefined;
  const parked = station ?? -1;
  const style = running ? { animationDelay: `${delay}ms` } : undefined;

  /** Running: hand the line to its keyframes. Still: resolve it outright. */
  const at = (needs: number, animation: string) =>
    running ? animation : parked >= needs ? "" : "opacity-0";

  const warm = lead.tone === "warm";

  return (
    <article
      className="glass glass-edge relative w-full max-w-[11rem] overflow-hidden px-3 py-2.5"
      aria-hidden
    >
      {/* The model reading the lead. One pass, ten percent of a cycle, and
          the only bright thing anywhere on the line. */}
      {running && (
        <span
          data-flow
          style={style}
          className="pointer-events-none absolute inset-0 animate-[flowScan_var(--cycle)_var(--ease-glide)_infinite_both] bg-[linear-gradient(90deg,transparent_34%,rgb(167_155_255/0.30)_50%,transparent_66%)]"
        />
      )}

      <p className="label-mono relative flex items-center gap-2 text-ash">
        <span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-slate" />
        {lead.channel}
      </p>

      <p
        data-flow
        style={style}
        className={`label-mono relative mt-2 flex flex-wrap items-center gap-x-2 ${
          warm ? "text-signal-lift" : "text-slate"
        } ${at(1, "animate-[flowTag_var(--cycle)_var(--ease-north)_infinite_both]")}`}
      >
        <span
          aria-hidden
          className={`h-1 w-1 shrink-0 rounded-full ${warm ? "bg-signal" : "bg-slate"}`}
        />
        {lead.toneLabel}
        {/* The narrowest phones have room for the tag or the priority, not
            both. The priority is the one the journal repeats anyway. */}
        <span className="hidden text-slate sm:inline">· {lead.priority}</span>
      </p>

      <p
        data-flow
        style={style}
        className={`label-mono relative mt-1.5 truncate text-bone ${at(2, "animate-[flowRoute_var(--cycle)_var(--ease-north)_infinite_both]")}`}
      >
        → {lead.route}
      </p>

      <p
        data-flow
        style={style}
        className={`label-mono relative mt-2 flex items-center justify-between gap-2 border-t border-hairline pt-2 text-signal-lift ${at(3, "animate-[flowFiled_var(--cycle)_var(--ease-north)_infinite_both]")}`}
      >
        {filedLabel}
        <span className="text-slate tabular-nums">#{card}</span>
      </p>
    </article>
  );
}
