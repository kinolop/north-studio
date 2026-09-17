"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useCopy, useLocale } from "@/components/i18n/CopyProvider";
import { PrintLines } from "@/components/motion/PrintLines";
import { TypeText } from "@/components/motion/TypeText";
import { Section } from "@/components/ui/Section";
import { classifyAgentIntent, getAgentReply, type AgentIntent } from "@/lib/northAgent";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface Turn {
  id: number;
  from: "agent" | "visitor";
  text: string;
}

/** If the visitor only watches, the chat asks its own first question. */
const SELF_START_MS = 8000;

type Level = "cold" | "warm" | "hot";

function readiness(intents: readonly AgentIntent[]): Level {
  const real = intents.filter((intent) => intent !== "other");
  if (real.some((intent) => intent === "trial" || intent === "human" || intent === "instalments") || real.length >= 3) {
    return "hot";
  }
  return real.length > 0 ? "warm" : "cold";
}

/**
 * The agent, working, next to what the manager gets out of it.
 *
 * On the left, a conversation with LEKTA's assistant: it greets you, you
 * ask (by tapping a question or typing your own) and it answers, typed out
 * as it writes. On the right, the client card a manager would open: every
 * question you ask is written into it by hand, readiness climbs as the
 * conversation turns into intent, and the next step changes with it. The
 * point of the section is that second panel: the agent does not only talk,
 * it hands over a client who has already been understood.
 *
 * Every reply goes through `getAgentReply`, the one seam to a live model.
 */
export function AgentChat() {
  const copy = useCopy();
  const { locale } = useLocale();
  const reduced = useReducedMotion();
  const chat = copy.agentCase.chat;
  const lead = chat.lead;

  const rootRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const ids = useRef(0);
  const touched = useRef(false);
  const [started, setStarted] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [thinking, setThinking] = useState(false);
  const [draft, setDraft] = useState("");
  const [intents, setIntents] = useState<AgentIntent[]>([]);

  const push = useCallback((from: Turn["from"], text: string) => {
    ids.current += 1;
    const turn = { id: ids.current, from, text };
    setTurns((current) => [...current, turn]);
  }, []);

  // Greet once the chat is in view.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setStarted(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -30% 0px" },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // Once per visit, however many times effects run in development.
  const greeted = useRef(false);
  useEffect(() => {
    if (!started || greeted.current) return;
    greeted.current = true;
    push("agent", chat.greeting);
  }, [started, chat.greeting, push]);

  /** Bumped whenever the conversation starts over, so a reply still on its way to the old one is dropped. */
  const conversation = useRef(0);

  const ask = useCallback(
    async (text: string, byVisitor = true) => {
      const clean = text.trim();
      if (!clean || thinking) return;
      if (byVisitor) touched.current = true;
      push("visitor", clean);
      setDraft("");
      const intent = classifyAgentIntent(clean);
      setIntents((current) => (current.includes(intent) ? current : [...current, intent]));
      setThinking(true);
      const asked = conversation.current;
      const reply = await getAgentReply(clean, locale);
      if (asked !== conversation.current) return;
      setThinking(false);
      push("agent", reply);
    },
    [thinking, push, locale],
  );

  // A language switch before the visitor has asked anything starts the
  // conversation over in the new language. Once they have, the conversation
  // is theirs and stays as it was written.
  const shownLocale = useRef(locale);
  useEffect(() => {
    if (shownLocale.current === locale) return;
    shownLocale.current = locale;
    if (touched.current || !greeted.current) return;
    conversation.current += 1;
    ids.current += 1;
    setTurns([{ id: ids.current, from: "agent", text: chat.greeting }]);
    setIntents([]);
    setThinking(false);
  }, [locale, chat.greeting]);

  // Nobody asked anything: ask the first question, once, to show the loop.
  useEffect(() => {
    if (!started) return;
    const id = window.setTimeout(() => {
      if (!touched.current) void ask(chat.suggestions[0] ?? "", false);
    }, SELF_START_MS);
    return () => window.clearTimeout(id);
    // Only the first greeting schedules this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  // Keep the latest line in view while it is still being typed, not only
  // when it arrives: an answer grows a character at a time.
  const threadRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const log = logRef.current;
    const thread = threadRef.current;
    if (!log || !thread || typeof ResizeObserver === "undefined") return;
    const follow = new ResizeObserver(() => {
      log.scrollTop = log.scrollHeight;
    });
    follow.observe(thread);
    return () => follow.disconnect();
  }, []);

  const restart = () => {
    touched.current = true;
    conversation.current += 1;
    ids.current += 1;
    setTurns([{ id: ids.current, from: "agent", text: chat.greeting }]);
    setIntents([]);
    setThinking(false);
  };

  const level = readiness(intents);
  const levelIndex = level === "cold" ? 1 : level === "warm" ? 2 : 3;
  const asked = intents.map((intent) => lead.intents[intent]);

  return (
    <Section id="agent-chat" flush className="py-band">
      <div ref={rootRef} className="sheet">
        <div className="sheet-grid items-end gap-y-6 border-t border-ink pt-8 lg:pt-10">
          <TypeText
            as="h2"
            lines={chat.title}
            className="poster col-span-12 text-[clamp(3.4rem,8.4vw,9rem)] text-ink lg:col-span-7"
          />
          <div className="col-span-12 lg:col-span-5">
            <PrintLines text={chat.lede} className="max-w-[44ch] text-[clamp(1.15rem,1.5vw,1.4rem)] leading-[1.35] text-ink" />
            <p className="mt-4 max-w-[48ch] text-small text-ink-soft">{copy.agentCase.brandNote}</p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-10 lg:mt-16 lg:grid-cols-12 lg:items-start lg:gap-8">
          {/* The conversation. */}
          <div className="min-w-0 lg:col-span-7">
            <div className="flex flex-col border-2 border-ink bg-[#f8f7f3]">
              <div className="flex items-center justify-between gap-4 border-b border-ink px-4 py-3">
                <span className="flex items-center gap-3">
                  <MiniBot />
                  <span className="text-small font-bold text-ink">{chat.agentRole}</span>
                </span>
                <span className="mark text-ink-mute">{chat.demoLabel}</span>
              </div>

              {/* data-lenis-prevent: the page's smooth scroll must let this
                  panel scroll on its own. */}
              <div
                ref={logRef}
                aria-live="polite"
                data-lenis-prevent
                className="h-[19rem] overflow-y-auto overscroll-contain px-4 py-5 sm:h-[26rem] sm:px-5"
              >
                <div ref={threadRef} className="flex min-h-full flex-col justify-end gap-3">
                  {turns.map((turn) => (
                    <Bubble key={turn.id} turn={turn} typed={!reduced && turn.from === "agent"} />
                  ))}
                  {thinking && (
                    <div className="flex items-center gap-1.5 self-start rounded-[12px] rounded-bl-[3px] border-[1.5px] border-cobalt bg-paper px-4 py-3.5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-cobalt motion-safe:animate-[thinkPulse_1.1s_ease-in-out_infinite]"
                          style={{ animationDelay: `${i * 160}ms` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-rule px-4 py-3">
                <p className="mark text-ink-mute">{chat.suggestionsLabel}</p>
                {/* One swipeable row on phones, so the questions do not push the answer off screen. */}
                <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                  {chat.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={thinking}
                      onClick={() => void ask(suggestion)}
                      className="shrink-0 border-2 border-rule px-3 py-1.5 text-small font-semibold whitespace-nowrap text-ink transition-colors duration-200 hover:border-cobalt hover:text-cobalt disabled:opacity-40"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void ask(draft);
                }}
                className="flex items-stretch border-t border-ink"
              >
                <label htmlFor="agent-draft" className="sr-only">
                  {chat.placeholder}
                </label>
                <input
                  id="agent-draft"
                  type="text"
                  value={draft}
                  maxLength={160}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={chat.placeholder}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-copy text-ink placeholder:text-ink-mute focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || thinking}
                  className="shrink-0 bg-ink px-5 text-small font-semibold text-paper transition-colors hover:bg-cobalt disabled:opacity-40"
                >
                  {chat.send}
                </button>
              </form>
            </div>
            <button type="button" onClick={restart} className="mark ink-link mt-4 text-ink-soft hover:text-ink">
              {chat.restart}
            </button>
          </div>

          {/* What the manager gets. */}
          <aside className="lg:col-span-5 lg:pt-6">
            <article className="relative rotate-[1.2deg] border-2 border-ink bg-[#f8f7f3] shadow-[0_40px_80px_-50px_rgb(18_18_17/0.7)]">
              <span aria-hidden className="absolute -top-3 left-10 h-6 w-24 -rotate-[4deg] bg-cobalt/85" />
              <header className="border-b border-ink px-5 pt-6 pb-4">
                <p className="text-[1.35rem] leading-tight font-bold text-ink">{lead.title}</p>
                <p className="mark mt-1 text-ink-mute">{lead.subtitle}</p>
              </header>

              <dl className="space-y-5 px-5 py-5">
                <div>
                  <dt className="mark text-cobalt">{lead.asked}</dt>
                  <dd className="mt-2 min-h-[2.2rem]">
                    {asked.length === 0 ? (
                      <span className="text-small text-ink-mute">{lead.empty}</span>
                    ) : (
                      <ul className="flex flex-wrap gap-x-4 gap-y-1">
                        {asked.map((label) => (
                          <li
                            key={label}
                            className="animate-[captionIn_500ms_var(--ease-print)_both] font-[family-name:var(--font-hand)] text-[1.55rem] leading-none font-semibold text-cobalt"
                          >
                            {label}
                          </li>
                        ))}
                      </ul>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="mark text-cobalt">{lead.readiness}</dt>
                  <dd className="mt-2 flex items-center gap-4">
                    <span className="flex gap-1.5" aria-hidden>
                      {[1, 2, 3].map((step) => (
                        <span
                          key={step}
                          className={`block h-3 w-8 border-2 border-cobalt transition-colors duration-500 ${step <= levelIndex && intents.length > 0 ? "bg-cobalt" : "bg-transparent"}`}
                        />
                      ))}
                    </span>
                    <span key={level} className="animate-[captionIn_400ms_var(--ease-print)_both] text-copy font-semibold text-ink">
                      {intents.length > 0 ? lead.levels[level] : <span className="text-ink-mute">—</span>}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="mark text-cobalt">{lead.next}</dt>
                  <dd
                    key={`${level}-${intents.length > 0}`}
                    className="mt-2 flex animate-[captionIn_500ms_var(--ease-print)_both] items-center gap-2 font-[family-name:var(--font-hand)] text-[1.7rem] leading-none font-semibold text-cobalt"
                  >
                    {intents.length > 0 ? (
                      <>
                        <svg aria-hidden viewBox="0 0 30 16" className="h-4 w-7 overflow-visible">
                          <path d="M1 9 C 10 6, 18 10, 27 8 M21 3 27 8 21 13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {lead.actions[level]}
                      </>
                    ) : (
                      <span className="text-copy text-ink-mute">—</span>
                    )}
                  </dd>
                </div>
              </dl>
            </article>
          </aside>
        </div>
      </div>
    </Section>
  );
}

/** The mascot's head, reduced to what an avatar needs: a dark face and two eyes. */
function MiniBot() {
  return (
    <span aria-hidden className="relative block h-9 w-9 rounded-full bg-ink">
      <span className="absolute top-[42%] left-[30%] h-2.5 w-1.5 rounded-full bg-cobalt shadow-[0_0_6px_1px_rgb(27_46_216/0.7)]" />
      <span className="absolute top-[42%] right-[30%] h-2.5 w-1.5 rounded-full bg-cobalt shadow-[0_0_6px_1px_rgb(27_46_216/0.7)]" />
    </span>
  );
}

/** One message. The agent's are typed out as they arrive. */
function Bubble({ turn, typed }: { turn: Turn; typed: boolean }) {
  const [shown, setShown] = useState(typed ? 0 : turn.text.length);

  useEffect(() => {
    if (!typed) return;
    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      const count = Math.min(turn.text.length, Math.floor((now - started) / 14) + 1);
      setShown(count);
      if (count < turn.text.length) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [typed, turn.text]);

  const agent = turn.from === "agent";
  return (
    <p
      className={[
        "max-w-[86%] animate-[bubbleIn_420ms_var(--ease-print)_both] px-4 py-3 text-copy leading-[1.45]",
        agent
          ? "self-start rounded-[12px] rounded-bl-[3px] border-[1.5px] border-cobalt bg-paper text-ink"
          : "self-end rounded-[12px] rounded-br-[3px] bg-ink text-paper",
      ].join(" ")}
    >
      <span className="sr-only">{turn.text}</span>
      <span aria-hidden>{turn.text.slice(0, shown)}</span>
    </p>
  );
}
