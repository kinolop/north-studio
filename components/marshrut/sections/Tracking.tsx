"use client";

import { useEffect, useRef } from "react";

import { MODES, byId } from "@/lib/marshrut/data";
import { num } from "@/lib/marshrut/format";
import type { Quote } from "@/lib/marshrut/model";
import { dayAt, kmAt, sAt } from "@/lib/marshrut/timeline";

import { Chapter } from "../Chapter";
import { Diary } from "../Diary";
import { moment, useMoment } from "../moment";
import { useQuote } from "../store";

/**
 * Chapter three, on the road: where the cargo is, and when it will arrive.
 *
 * Scroll is the clock here. The camera follows the cargo across China and
 * the day counter runs, set as large as the page allows; the towns it
 * passes are marked on the map itself with the day it reached each. Under
 * the counter, the reason the page gives times as odds: the chance, day by
 * day, that the cargo is already at the warehouse. The vertical line on
 * that curve is today, and it walks along it with the reader.
 */


/** The chance the cargo has arrived by the end of `day`. */
function chance(q: Quote, day: number): number {
  let best = 0;
  for (const point of q.days.curve) if (point.day <= day) best = point.p;
  return best;
}

const W = 420;
const H = 150;
const L = 34;
const R = 10;
const T = 12;
const B = 26;

export function Tracking() {
  const q = useQuote();
  const mode = byId(MODES, q.input.mode);
  // The log moves in steps of a tenth of a day; nothing finer is visible.
  const tenth = useMoment((m) => (m.chapter >= 3 ? Math.round(m.day * 10) : 0), 0);
  const today = tenth / 10;

  const dayRef = useRef<HTMLSpanElement>(null);
  const nowRef = useRef<SVGGElement>(null);

  const curve = q.days.curve;
  const d0 = curve[0]?.day ?? 0;
  const d1 = curve[curve.length - 1]?.day ?? 1;
  const rr = (v: number) => Math.round(v * 100) / 100;
  const xOf = (d: number) => rr(L + ((Math.min(d1, Math.max(d0, d)) - d0) / Math.max(1, d1 - d0)) * (W - L - R));
  const yOf = (p: number) => rr(T + (1 - p) * (H - T - B));
  const path = curve.map((pt, i) => `${i === 0 ? "M" : "L"}${xOf(pt.day).toFixed(1)},${yOf(pt.p).toFixed(1)}`).join(" ");

  // The counter and the line on the curve move every frame, so they are written directly.
  useEffect(() => {
    let last = "";
    return moment.subscribe((m) => {
      const day = m.chapter >= 3 ? m.day : 0;
      const key = `${Math.floor(day)}|${Math.round(m.s / 10000)}`;
      const x = xOf(day);
      nowRef.current?.setAttribute("transform", `translate(${x.toFixed(1)} 0)`);
      if (key === last) return;
      last = key;
      if (dayRef.current) dayRef.current.textContent = num(day >= q.days.p50 - 0.02 ? Math.round(q.days.p50) : Math.floor(day));
    });
    // xOf depends on the curve only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // The log entry: the last town behind, the distance still to the border.
  const gateDay = dayAt(q, q.route.gate.s);
  const behind = q.route.stops.filter((st) => dayAt(q, st.s) <= today).pop();
  const toGate = Math.max(0, Math.round(kmAt(q, q.route.gate.s) - kmAt(q, sAt(q, Math.min(today, gateDay)))));
  const entry =
    today < 1
      ? `${q.route.origin.name}: груз ушёл со склада.`
      : `${behind ? behind.name : q.route.origin.name} позади, до границы ${num(toGate)} км.`;

  const p50 = Math.round(q.days.p50);
  const p95 = Math.round(q.days.p95);

  return (
    <Chapter
      id="tracking"
      index={3}
      km={0}
      place={`${q.route.origin.name} → ${q.route.gate.name}, ${mode.name.toLowerCase()}`}
      className="mr-tracking"
    >
      <Diary day={today}>{entry}</Diary>
      <h2 className="mr-h2 mr-h2-small" id="tracking-title">
        {"Срок — это вероятность, а не обещание"}
      </h2>

      <div className="mr-odometer" aria-hidden>
        <span ref={dayRef} className="mr-day-huge mr-num">
          0
        </span>
        <span className="mr-day-cap">
          день
          <br />
          из {num(p50)}
        </span>
      </div>

      <div className="mr-odds">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Вероятность, что груз уже на складе, по дням">
          {[0, 0.5, 1].map((p) => (
            <g key={p}>
              <line x1={L} x2={W - R} y1={yOf(p)} y2={yOf(p)} className="mr-grid" />
              <text x={L - 6} y={yOf(p) + 3.5} textAnchor="end" className="mr-axis">
                {Math.round(p * 100)}%
              </text>
            </g>
          ))}
          {Array.from({ length: d1 - d0 + 1 }, (_, i) => d0 + i)
            .filter((d) => d % 5 === 0)
            .map((d) => (
              <text key={d} x={xOf(d)} y={H - 8} textAnchor="middle" className="mr-axis">
                {d}
              </text>
            ))}
          <path d={path} className="mr-curve mr-curve-drawn" />
          {[
            { v: q.days.p50, p: 0.5 },
            { v: q.days.p95, p: 0.95 },
          ].map((m) => (
            <g key={m.p}>
              <line x1={xOf(m.v)} x2={xOf(m.v)} y1={yOf(m.p)} y2={H - B} className="mr-mark-line" />
              <circle cx={xOf(m.v)} cy={yOf(m.p)} r={3} className="mr-mark-dot" />
            </g>
          ))}
          <g ref={nowRef} className="mr-now">
            <line x1={0} x2={0} y1={T} y2={H - B} />
            <text x={5} y={T + 9} textAnchor="start">
              сегодня
            </text>
          </g>
        </svg>
        <p className="mr-odds-read">
          Половина грузов на складе к <b className="mr-num">{num(p50)}-му</b> дню, девятнадцать из двадцати к{" "}
          <b className="mr-num">{num(p95)}-му</b>. Сейчас шанс успеть к {num(p50)}-му:{" "}
          <b className="mr-num">{num(Math.round(chance(q, p50) * 100))}%</b>. Кривую пересчитываем на границе и пишем вам в
          тот же день.
        </p>
      </div>
    </Chapter>
  );
}
