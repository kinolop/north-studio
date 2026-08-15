"use client";

import type { JournalEntry } from "@/lib/conveyor";
import type { FlowLead } from "@/lib/i18n/types";

interface FlowJournalProps {
  entries: readonly JournalEntry[];
  leads: readonly FlowLead[];
  title: string;
  liveLabel: string;
  note: string;
}

/**
 * The line, writing down what it just did.
 *
 * Set in mono at label size but *not* uppercased: this is a log, and six
 * lines of shouting Cyrillic is unreadable in a way six lines of a real
 * console never is. Colour carries the grammar instead — the time and the
 * card number recede, the tag and the person it went to do not.
 *
 * Not a live region, deliberately. A new line lands every two seconds; an
 * `aria-live` announcement of each one would make the page unusable with a
 * screen reader on. The journal is a demonstration of the machine, and the
 * prose beside it says the same thing in a sentence.
 */
export function FlowJournal({
  entries,
  leads,
  title,
  liveLabel,
  note,
}: FlowJournalProps) {
  return (
    <div className="glass glass-edge flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-hairline px-5 py-4 lg:px-6">
        <p className="label-mono text-ash">{title}</p>
        <p className="label-mono flex items-center gap-2.5 text-slate">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
          </span>
          {liveLabel}
        </p>
      </div>

      {/* Oldest lines are clipped rather than scrolled, and the mask makes
          that read as history leaving the top of the panel. */}
      <ol className="flex min-h-[11rem] flex-1 flex-col justify-end gap-2.5 overflow-hidden px-5 py-5 [mask-image:linear-gradient(to_bottom,transparent,black_2.5rem)] lg:px-6">
        {entries.map((entry) => {
          const lead = leads[entry.lead];
          if (!lead) return null;

          return (
            <li
              key={entry.id}
              className="flex flex-wrap items-center gap-x-2 font-mono text-[0.6875rem] leading-[1.5] tracking-[0.055em] motion-safe:animate-[bubbleIn_420ms_var(--ease-north)_both]"
            >
              <span className="text-slate tabular-nums">{entry.time}</span>
              <Dot />
              <span className="text-ash">{lead.source}</span>
              <Dot />
              <span
                className={lead.tone === "warm" ? "text-signal-lift" : "text-slate"}
              >
                {lead.toneLabel}
              </span>
              <Dot />
              <span className="text-bone">→ {lead.route}</span>
              <span className="ml-auto text-slate/70 tabular-nums">
                #{entry.card}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="border-t border-hairline px-5 py-4 text-meta text-slate lg:px-6">
        {note}
      </p>
    </div>
  );
}

function Dot() {
  return (
    <span aria-hidden className="text-hairline">
      ·
    </span>
  );
}
