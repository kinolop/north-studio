"use client";

import { useEffect, useRef, useState } from "react";

import { CodedBackdrop } from "@/components/atmosphere/SectionBackdrop";
import { useCopy, useLocale } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { getAgentReply } from "@/lib/northAgent";
import { agentSectionById } from "@/lib/sections";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useReveal } from "@/lib/useReveal";

const meta = agentSectionById("agent-chat");

const THINKING_MS = 900;
const BEAT_MS = 1300;

interface Turn {
  from: "student" | "agent";
  text: string;
}

/**
 * The centrepiece: the agent closing an enrolment.
 *
 * Every reply — scripted or typed — goes through `getAgentReply` in
 * lib/northAgent.ts. That function is the entire seam to a live model, and
 * routing the scripted turns through the same async path means the timing,
 * the typing indicator and the failure handling are already correct when a
 * real endpoint replaces it.
 */
export function AgentChat() {
  const copy = useCopy();
  const { locale } = useLocale();
  const reduced = useReducedMotion();

  const hostRef = useRef<HTMLDivElement>(null);
  const phase = useReveal(hostRef);
  const started = phase !== "armed";

  const chat = copy.agentCase.chat;
  const script = chat.script;

  const [turns, setTurns] = useState<Turn[]>([]);
  const [thinking, setThinking] = useState(false);
  const [draft, setDraft] = useState("");
  const [scriptDone, setScriptDone] = useState(false);
  /** Bumping this re-runs the transcript effect — replay and first play
   *  therefore share one code path instead of two that can drift. */
  const [runId, setRunId] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);

  // Play the transcript once the window is on screen. A conversation that
  // finished before you scrolled to it is a wall of text, not a demo.
  useEffect(() => {
    if (!started) return;

    if (reduced) {
      setTurns([...script]);
      setScriptDone(true);
      return;
    }

    setTurns([]);
    setThinking(false);
    setScriptDone(false);

    let index = 0;
    const timers: number[] = [];

    const step = () => {
      if (index >= script.length) {
        setScriptDone(true);
        return;
      }
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

    timers.push(window.setTimeout(step, 500));
    return () => timers.forEach(window.clearTimeout);
  }, [started, reduced, script, runId]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [turns, thinking]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (text.length === 0 || thinking) return;

    setTurns((prev) => [...prev, { from: "student", text }]);
    setDraft("");
    setThinking(true);

    // Already async, so swapping in a real endpoint needs no change here.
    const reply = await getAgentReply(text, locale);
    setThinking(false);
    setTurns((prev) => [...prev, { from: "agent", text: reply }]);
  }

  function replay() {
    setRunId((n) => n + 1);
  }

  return (
    <Section id={meta.id} className="overflow-hidden">
      <CodedBackdrop tone="machine" className="-z-10" />

      <div className="container-north grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-5">
          <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />

          <SplitLines
            as="h2"
            lines={chat.title}
            className="mt-8 text-display font-display font-medium text-bone"
          />

          <Reveal delay={0.08}>
            <p className="mt-8 max-w-[46ch] text-body text-ash">{chat.lede}</p>
          </Reveal>

          <Reveal delay={0.14}>
            {/* An honesty note, not a caption: six lines of uppercase mono
                is a wall. Set as small body text so it is actually read. */}
            <p className="mt-8 flex max-w-[46ch] gap-3 text-meta leading-[1.7] text-slate">
              <span
                aria-hidden
                className="mt-[0.5em] inline-block h-1 w-1 shrink-0 rounded-full bg-signal/70"
              />
              {copy.agentCase.brandNote}
            </p>
          </Reveal>
        </div>

        <div ref={hostRef} className="lg:col-span-6 lg:col-start-7">
          <Reveal>
            <div className="glass flex flex-col overflow-hidden">
              <div className="flex items-center justify-between gap-4 border-b border-hairline px-6 py-4">
                <p className="label-mono flex items-center gap-2.5 text-ash">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60 motion-reduce:hidden" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
                  </span>
                  {chat.agentRole}
                </p>
                <p className="label-mono text-slate">{chat.demoLabel}</p>
              </div>

              <div ref={logRef} aria-live="polite" className="h-[27rem] overflow-y-auto p-6">
                <div className="flex min-h-full flex-col justify-end gap-4">
                  {turns.map((turn, index) => (
                    <Bubble
                      key={`${index}-${turn.text.slice(0, 14)}`}
                      turn={turn}
                      label={turn.from === "agent" ? chat.agentRole : chat.studentRole}
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
                <label htmlFor="lekta-draft" className="sr-only">
                  {chat.placeholder}
                </label>
                <input
                  id="lekta-draft"
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={chat.placeholder}
                  className="w-full rounded-[var(--radius-control)] border border-hairline bg-white/[0.025] px-4 py-2.5 text-meta text-bone placeholder:text-slate transition-[border-color] duration-[var(--duration-state)] focus:border-signal/60 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={draft.trim().length === 0 || thinking}
                  className="shrink-0 rounded-[var(--radius-control)] border border-hairline px-4 py-2.5 text-meta text-bone transition-[border-color,opacity] duration-[var(--duration-state)] hover:border-signal/50 disabled:opacity-40"
                >
                  {chat.send}
                </button>
              </form>
            </div>
          </Reveal>

          {scriptDone && !reduced && (
            <button
              type="button"
              onClick={replay}
              className="label-mono mt-4 text-slate transition-colors duration-[var(--duration-state)] hover:text-ash"
            >
              ↺ {chat.replay}
            </button>
          )}
        </div>
      </div>
    </Section>
  );
}

function Bubble({ turn, label }: { turn: Turn; label: string }) {
  const isAgent = turn.from === "agent";

  return (
    <div
      className={[
        "flex max-w-[86%] flex-col gap-1.5",
        isAgent ? "self-start" : "items-end self-end",
        "motion-safe:animate-[bubbleIn_420ms_var(--ease-north)_both]",
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
