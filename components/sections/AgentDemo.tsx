"use client";

import { useEffect, useRef, useState } from "react";

import { useChannelOverlay } from "@/components/contact/ChannelOverlayProvider";
import { useCopy } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { sectionById } from "@/lib/sections";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useReveal } from "@/lib/useReveal";

const meta = sectionById("agent");

/** Time the agent spends "thinking" before a scripted reply lands. */
const THINKING_MS = 900;
/** Pause after a message before the next one starts. */
const BEAT_MS = 1250;

interface Turn {
  from: "visitor" | "agent";
  text: string;
}

/**
 * The proof for the AI-agents service.
 *
 * Describing an agent convinces nobody; watching one work is the argument.
 * So this section is the demonstration, and it is honest about being one —
 * the label says it is a script, because a "live AI" that is really six
 * hard-coded strings is the kind of small lie that costs a studio the
 * client it was trying to win.
 *
 * The seam for making it real is deliberate and narrow: replace `respond()`
 * with a fetch to a model endpoint and nothing else in this file changes.
 *
 * The transcript only starts playing once the section is actually on
 * screen — a conversation that has already finished by the time you scroll
 * to it is a wall of text, not a demonstration.
 */
export function AgentDemo() {
  const copy = useCopy();
  const { open } = useChannelOverlay();
  const reduced = useReducedMotion();

  const hostRef = useRef<HTMLDivElement>(null);
  const phase = useReveal(hostRef);
  const started = phase !== "armed";

  const [turns, setTurns] = useState<Turn[]>([]);
  const [thinking, setThinking] = useState(false);
  const [draft, setDraft] = useState("");

  const logRef = useRef<HTMLDivElement>(null);
  const script = copy.agent.script;

  // Play the transcript. Under reduced motion the whole thing is present
  // immediately — the content is the point, the typing is decoration.
  useEffect(() => {
    if (!started) return;

    if (reduced) {
      setTurns([...script]);
      return;
    }

    setTurns([]);
    setThinking(false);

    let index = 0;
    const timers: number[] = [];

    const step = () => {
      if (index >= script.length) return;
      const turn = script[index]!;
      index += 1;

      if (turn.from === "agent") {
        setThinking(true);
        timers.push(
          window.setTimeout(() => {
            setThinking(false);
            setTurns((prev) => [...prev, turn]);
            timers.push(window.setTimeout(step, BEAT_MS));
          }, THINKING_MS),
        );
      } else {
        setTurns((prev) => [...prev, turn]);
        timers.push(window.setTimeout(step, BEAT_MS));
      }
    };

    timers.push(window.setTimeout(step, 400));
    return () => timers.forEach(window.clearTimeout);
  }, [started, reduced, script]);

  // Keep the newest message in view without moving the page around it.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [turns, thinking]);

  /** The seam. Swap this for a real endpoint and the UI is unchanged. */
  function respond(): string {
    return copy.agent.reply;
  }

  function send(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (text.length === 0 || thinking) return;

    setTurns((prev) => [...prev, { from: "visitor", text }]);
    setDraft("");
    setThinking(true);

    window.setTimeout(() => {
      setThinking(false);
      setTurns((prev) => [...prev, { from: "agent", text: respond() }]);
    }, reduced ? 0 : THINKING_MS);
  }

  return (
    <Section id={meta.id}>
      <div className="container-north grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-5">
          <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />

          <SplitLines
            as="h2"
            lines={copy.agent.title}
            className="mt-8 text-display font-display font-medium text-bone"
          />

          <Reveal delay={0.08}>
            <p className="mt-8 max-w-[44ch] text-body text-ash">{copy.agent.lede}</p>
          </Reveal>

          <Reveal delay={0.16}>
            <button
              type="button"
              onClick={() => open()}
              className="group mt-10 inline-flex items-center gap-3 rounded-[var(--radius-control)] border border-hairline bg-[linear-gradient(180deg,rgb(255_255_255/0.06),rgb(255_255_255/0.015))] px-6 py-3 text-meta text-bone transition-[border-color] duration-[var(--duration-state)] ease-[var(--ease-north)] hover:border-signal/50"
            >
              {copy.agent.cta}
              <svg aria-hidden viewBox="0 0 24 10" className="h-[10px] w-6 text-signal-lift">
                <path
                  d="M0 5h21M17 1l4 4-4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  className="transition-transform duration-[var(--duration-state)] ease-[var(--ease-north)] group-hover:translate-x-1"
                />
              </svg>
            </button>
          </Reveal>
        </div>

        <div ref={hostRef} className="lg:col-span-6 lg:col-start-7">
          <Reveal>
            <div className="glass flex flex-col overflow-hidden">
              {/* Window chrome: a status dot and an honest label. */}
              <div className="flex items-center justify-between gap-4 border-b border-hairline px-6 py-4">
                <p className="label-mono flex items-center gap-2.5 text-ash">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60 motion-reduce:hidden" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
                  </span>
                  {copy.agent.agentRole}
                </p>
                <p className="label-mono text-slate">{copy.agent.demoLabel}</p>
              </div>

              {/* Messages sit at the FOOT of the log and grow upward, the way
                  every chat client the visitor already uses behaves. Anchored
                  to the top instead, a two-message conversation left a large
                  empty pane below it and read as broken rather than early. */}
              <div
                ref={logRef}
                aria-live="polite"
                className="h-[26rem] overflow-y-auto p-6"
              >
                <div className="flex min-h-full flex-col justify-end gap-4">
                {turns.map((turn, index) => (
                  <Bubble
                    key={`${index}-${turn.text.slice(0, 12)}`}
                    turn={turn}
                    label={
                      turn.from === "agent" ? copy.agent.agentRole : copy.agent.visitorRole
                    }
                    reduced={reduced}
                  />
                ))}

                {thinking && (
                  <div className="flex items-center gap-1.5 self-start rounded-[var(--radius-plate)] border border-hairline bg-white/[0.03] px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-slate motion-safe:animate-[thinkPulse_1.1s_ease-in-out_infinite]"
                        style={{ animationDelay: `${i * 160}ms` }}
                      />
                    ))}
                  </div>
                )}
                </div>
              </div>

              <form
                onSubmit={send}
                className="flex items-center gap-3 border-t border-hairline p-4"
              >
                <label htmlFor="agent-draft" className="sr-only">
                  {copy.agent.placeholder}
                </label>
                <input
                  id="agent-draft"
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={copy.agent.placeholder}
                  className="w-full rounded-[var(--radius-control)] border border-hairline bg-white/[0.025] px-4 py-2.5 text-meta text-bone placeholder:text-slate transition-[border-color] duration-[var(--duration-state)] focus:border-signal/60 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={draft.trim().length === 0}
                  className="shrink-0 rounded-[var(--radius-control)] border border-hairline px-4 py-2.5 text-meta text-bone transition-[border-color,opacity] duration-[var(--duration-state)] hover:border-signal/50 disabled:opacity-40"
                >
                  {copy.agent.send}
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

function Bubble({
  turn,
  label,
  reduced,
}: {
  turn: Turn;
  label: string;
  reduced: boolean;
}) {
  const isAgent = turn.from === "agent";

  return (
    <div
      className={[
        "flex max-w-[85%] flex-col gap-1.5",
        isAgent ? "self-start" : "self-end items-end",
        reduced ? "" : "motion-safe:animate-[bubbleIn_420ms_var(--ease-north)_both]",
      ].join(" ")}
    >
      <span className="label-mono text-slate">{label}</span>
      <p
        className={[
          "rounded-[var(--radius-plate)] border px-4 py-3 text-meta leading-[1.6]",
          isAgent
            ? "border-signal/25 bg-signal/[0.07] text-bone"
            : "border-hairline bg-white/[0.03] text-ash",
        ].join(" ")}
      >
        {turn.text}
      </p>
    </div>
  );
}
