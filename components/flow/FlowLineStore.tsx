"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { qualify, STATION_COUNT, STATION_MS, type LineLead } from "@/lib/flowLine";
import type { Copy, FlowChannel } from "@/lib/i18n/types";

export type JournalKind = "received" | "qualified" | "routed" | "filed";

export interface JournalEntry {
  id: number;
  leadId: number;
  kind: JournalKind;
  /** Minutes since midnight on the demo's night clock. */
  minute: number;
}

interface LineContext {
  leads: LineLead[];
  journal: JournalEntry[];
  send: (channel: FlowChannel, text: string, mine: boolean) => void;
  reset: () => void;
}

const Context = createContext<LineContext | null>(null);

/** The demo's night starts just before midnight. */
const NIGHT_START = 23 * 60 + 38;
const KEEP = 80;

export function formatMinute(minute: number) {
  const m = ((minute % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/**
 * The line's state, shared by the section you drive it from and the report
 * it feeds, so the morning report is built from what actually happened on
 * this page.
 *
 * One enquiry travels at a time, as it does on a real line: the rest wait
 * in the queue. Every station it reaches writes a line to the journal, on a
 * night clock that moves on a few minutes for each new enquiry.
 */
export function FlowLineProvider({ children }: { children: ReactNode }) {
  const copy = useCopy();
  const managers = copy.flowCase.managers.length;
  const heroLeads = copy.flowCase.hero.leads;
  const [leads, setLeads] = useState<LineLead[]>(() => seedFromHero(heroLeads, managers));
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const ids = useRef(heroLeads.length);
  const turn = useRef(heroLeads.filter((lead) => lead.tone === "warm").length);
  const clock = useRef(NIGHT_START + heroLeads.length * 4);
  /** When each enquiry arrived on the night clock; each station adds a minute. */
  const arrivals = useRef(new Map<number, number>());

  const log = useCallback((leadId: number, kind: JournalKind) => {
    ids.current += 1;
    const step = kind === "received" ? 0 : kind === "qualified" ? 0 : kind === "routed" ? 1 : 1;
    const minute = (arrivals.current.get(leadId) ?? clock.current) + step;
    const entry = { id: ids.current, leadId, kind, minute };
    setJournal((current) => [...current, entry].slice(-KEEP));
  }, []);

  const send = useCallback(
    (channel: FlowChannel, text: string, mine: boolean) => {
      const clean = text.trim().slice(0, 140);
      if (!clean) return;
      const verdict = qualify(clean);
      let route = -1;
      if (verdict.tone === "warm") {
        route = turn.current % managers;
        turn.current += 1;
      }
      ids.current += 1;
      clock.current += 2 + (ids.current % 5);
      const lead: LineLead = {
        id: ids.current,
        channel,
        text: clean,
        mine,
        tone: verdict.tone,
        priority: verdict.priority,
        route,
        stage: 0,
        at: new Date(),
      };
      arrivals.current.set(lead.id, clock.current);
      setLeads((current) => [...current, lead].slice(-KEEP));
      log(lead.id, "received");
    },
    [log, managers],
  );

  // The hero's enquiries follow the language switch; the visitor's own stay as typed.
  useEffect(() => {
    setLeads((current) =>
      current.map((lead) =>
        lead.seed === undefined ? lead : { ...lead, text: heroLeads[lead.seed]?.text ?? lead.text },
      ),
    );
  }, [heroLeads]);

  const reset = useCallback(() => {
    setLeads([]);
    setJournal([]);
    arrivals.current.clear();
    turn.current = 0;
    clock.current = NIGHT_START;
  }, []);

  // Move the enquiry at the head of the line on to its next station.
  // Keyed on the head's id and stage, not the object: a new enquiry joining
  // the queue must not restart the clock of the one already moving.
  const active = leads.find((lead) => lead.stage < STATION_COUNT);
  const activeId = active?.id;
  const activeStage = active?.stage;
  useEffect(() => {
    if (activeId === undefined || activeStage === undefined) return;
    const id = window.setTimeout(() => {
      const next = activeStage + 1;
      setLeads((current) =>
        current.map((lead) => (lead.id === activeId ? { ...lead, stage: next } : lead)),
      );
      if (next === 1) log(activeId, "qualified");
      if (next === 2) log(activeId, "routed");
      if (next === 3) log(activeId, "filed");
    }, STATION_MS);
    return () => window.clearTimeout(id);
  }, [activeId, activeStage, log]);

  const value = useMemo(() => ({ leads, journal, send, reset }), [leads, journal, send, reset]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

/**
 * The ten enquiries the hero sorted, already filed, so the line picks up
 * where the scene above left off rather than from an empty board. Routed
 * the same way the hero routes them: warm ones in turn, cold to nurture.
 */
function seedFromHero(heroLeads: Copy["flowCase"]["hero"]["leads"], managers: number): LineLead[] {
  let turn = 0;
  return heroLeads.map((lead, i) => {
    const route = lead.tone === "cold" ? -1 : turn++ % managers;
    return {
      id: i + 1,
      channel: lead.channel,
      text: lead.text,
      mine: false,
      tone: lead.tone,
      priority: qualify(lead.text).priority,
      route,
      stage: STATION_COUNT,
      at: new Date(0),
      seed: i,
    };
  });
}

export function useFlowLine(): LineContext {
  const context = useContext(Context);
  if (!context) throw new Error("useFlowLine must be used inside <FlowLineProvider>");
  return context;
}
