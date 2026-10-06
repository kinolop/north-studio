"use client";

import { BAKES, PLACE, WARM_MIN, agoWords, bakeStates, breadById, clock, inWords } from "@/lib/kotelnaya/data";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { useMoscowMinutes } from "./clock";

/** The dial runs from when the oven is lit to an hour after closing. */
const START = 6 * 60;
const END = 22 * 60;
const SWEEP = 270;
const A0 = 135;
const CX = 180;
const CY = 180;

const angle = (min: number) => A0 + (SWEEP * (Math.min(END, Math.max(START, min)) - START)) / (END - START);
const pt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as const;
};
const f = (n: number) => n.toFixed(2);

function arc(r: number, from: number, to: number) {
  const [x0, y0] = pt(r, from);
  const [x1, y1] = pt(r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M${f(x0)} ${f(y0)} A${r} ${r} 0 ${large} 1 ${f(x1)} ${f(y1)}`;
}

/**
 * The oven's day, drawn as the pressure gauge that once hung on this wall.
 *
 * The face runs from six in the morning, when the oven is lit, to ten at
 * night. Each batch is a mark on the rim; the needle is Moscow's time now,
 * and the red line, which on a boiler gauge marks the pressure not to pass,
 * here marks the last three-quarters of an hour: whatever came out inside
 * it is still warm. Beside the dial, the same day as a timetable.
 */
export function Oven() {
  const min = useMoscowMinutes();
  const reduced = useReducedMotion();
  const states = min === null ? null : bakeStates(min);
  const needle = min === null ? A0 : angle(min);
  const live = min !== null && min >= START && min <= END;

  const ticks: { deg: number; hour: boolean }[] = [];
  for (let m = START; m <= END; m += 30) ticks.push({ deg: angle(m), hour: m % 60 === 0 });
  const labels: { deg: number; text: string }[] = [];
  for (let h = 6; h <= 22; h += 2) labels.push({ deg: angle(h * 60), text: String(h) });

  return (
    <section id="oven" className="kt-oven" aria-labelledby="kt-oven-title">
      <div className="kt-wrap">
        <div className="kt-oven-grid">
          <figure className="kt-gauge">
            <svg
              viewBox="0 0 360 360"
              role="img"
              aria-label={min === null ? "Циферблат печи" : `Циферблат печи, сейчас ${clock(min)} по Москве`}
            >
              <defs>
                <radialGradient id="kt-g-steel" cx="50%" cy="38%" r="62%">
                  <stop offset="0%" stopColor="#4a4540" />
                  <stop offset="70%" stopColor="#24201d" />
                  <stop offset="100%" stopColor="#0f0d0c" />
                </radialGradient>
                <radialGradient id="kt-g-enamel" cx="46%" cy="40%" r="70%">
                  <stop offset="0%" stopColor="#f3ecdf" />
                  <stop offset="100%" stopColor="#ddd2bf" />
                </radialGradient>
              </defs>
              <circle cx={CX} cy={CY} r={179} fill="url(#kt-g-steel)" />
              <circle cx={CX} cy={CY} r={168} className="kt-g-lip" />
              <circle cx={CX} cy={CY} r={164} fill="url(#kt-g-enamel)" />
              <path d={arc(150, A0, A0 + SWEEP)} className="kt-g-track" />
              {/* The red line: still warm. */}
              {live && min !== null && <path d={arc(150, angle(min - WARM_MIN), angle(min))} className="kt-g-red" />}
              {ticks.map((t) => {
                const [x0, y0] = pt(t.hour ? 136 : 143, t.deg);
                const [x1, y1] = pt(152, t.deg);
                return (
                  <line
                    key={t.deg}
                    x1={f(x0)}
                    y1={f(y0)}
                    x2={f(x1)}
                    y2={f(y1)}
                    className={t.hour ? "kt-g-tick kt-g-hour" : "kt-g-tick"}
                  />
                );
              })}
              {labels.map((l) => {
                const [x, y] = pt(116, l.deg);
                return (
                  <text key={l.text} x={f(x)} y={f(y)} className="kt-g-num">
                    {l.text}
                  </text>
                );
              })}
              {BAKES.map((b, i) => {
                const [x, y] = pt(160, angle(b.at));
                return (
                  <circle key={i} cx={f(x)} cy={f(y)} r={3.4} className="kt-g-bake" data-state={states?.[i] ?? "later"} />
                );
              })}
              {/* The maker's plate sits in the quarter the needle never crosses. */}
              <text x={CX} y={CY + 50} className="kt-g-time">
                {min === null ? "--:--" : clock(min)}
              </text>
              <text x={CX} y={CY + 78} className="kt-g-maker">
                КОТЕЛЬНАЯ
              </text>
              <text x={CX} y={CY + 94} className="kt-g-maker kt-g-small">
                С.-ПЕТЕРБУРГЪ · {PLACE.built}
              </text>
              <g
                className="kt-g-needle"
                style={{
                  transform: `rotate(${needle}deg)`,
                  transformOrigin: `${CX}px ${CY}px`,
                  transition: reduced ? "none" : undefined,
                }}
              >
                <line x1={CX - 22} y1={CY} x2={CX + 134} y2={CY} />
              </g>
              <circle cx={CX} cy={CY} r={8} className="kt-g-hub" />
              <circle cx={CX} cy={CY} r={2.6} className="kt-g-pin" />
            </svg>
          </figure>

          <div className="kt-oven-log">
            <h2 id="kt-oven-title" className="kt-h2" data-kt-split>
              Из печи
            </h2>
            <p className="kt-lead">
              Печь растапливаем в шесть утра, и хлеб выходит партиями до вечера. Стрелка показывает московское время,
              красная черта отмечает то, что ещё тёплое.
            </p>
          <ol className="kt-bakes">
            {BAKES.map((b, i) => {
              const s = states?.[i];
              const bread = breadById(b.bread);
              let note = "";
              if (min !== null && s === "warm") note = `тёплый, ${agoWords(min - b.at)}`;
              else if (min !== null && s === "next") note = inWords(b.at - min);
              else if (s === "done") note = "на полке";
              return (
                <li key={i} className="kt-bake" data-state={s ?? "later"}>
                  <span className="kt-bake-time kt-num">{clock(b.at)}</span>
                  <span className="kt-bake-name">{bread.name}</span>
                  <span className="kt-bake-note">{note}</span>
                </li>
              );
            })}
          </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
