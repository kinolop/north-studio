"use client";

import { useEffect, useState } from "react";

import { STUDIO, moscowNow } from "@/lib/krug/data";

const WEEK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;
/** Monday-first order into the Sunday-first table. */
const ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

/** Whether the studio is open now, and the sentence that says so. */
function openNow(now: Date): { open: boolean; text: string } {
  const wd = now.getDay();
  const h = now.getHours() + now.getMinutes() / 60;
  const today = STUDIO.hours[wd];
  if (today && h >= today[0] && h < today[1]) {
    const left = today[1] - h;
    const hh = Math.floor(left);
    const mm = Math.round((left - hh) * 60);
    return {
      open: true,
      text: `Открыто до ${today[1]}:00, ещё ${hh ? `${hh} ч ` : ""}${mm} мин`,
    };
  }
  if (today && h < today[0]) return { open: false, text: `Закрыто, откроемся сегодня в ${today[0]}:00` };
  for (let i = 1; i <= 7; i += 1) {
    const next = STUDIO.hours[(wd + i) % 7];
    if (next) return { open: false, text: `Закрыто, откроемся ${i === 1 ? "завтра" : "во вторник"} в ${next[0]}:00` };
  }
  return { open: false, text: "Закрыто" };
}

/**
 * Where the studio is, drawn as an architect would draw it: the plan of the
 * room at 1:100, six wheels along the windows, the kilns behind a wall of
 * their own. Beside it the address, the way in from the courtyard and the
 * hours, with today's line marked and a clock that knows Moscow time.
 */
export function Studio() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(moscowNow());
    tick();
    const t = window.setInterval(tick, 30_000);
    return () => window.clearInterval(t);
  }, []);

  const status = now ? openNow(now) : null;
  const today = now?.getDay();

  return (
    <section id="studio" className="kr-studio" aria-labelledby="kr-studio-title">
      <div className="kr-wrap kr-studio-grid">
        <figure className="kr-plan">
          <Plan />
          <figcaption className="kr-num">План мастерской, 1:100</figcaption>
        </figure>

        <div className="kr-studio-info">
          <h2 id="kr-studio-title" className="kr-h2">
            Мастерская
          </h2>
          <p className="kr-status" data-open={status?.open ?? false} aria-live="polite">
            {status?.text ?? " "}
          </p>

          <dl className="kr-facts">
            <div>
              <dt>Адрес</dt>
              <dd>
                {STUDIO.city}, {STUDIO.address}
                <br />
                {STUDIO.entrance}
              </dd>
            </div>
            <div>
              <dt>Метро</dt>
              <dd>{STUDIO.metro}</dd>
            </div>
            <div>
              <dt>Телефон</dt>
              <dd className="kr-num">{STUDIO.phone}</dd>
            </div>
          </dl>

          <table className="kr-hours">
            <caption>Часы работы</caption>
            <tbody>
              {ORDER.map((wd, i) => {
                const h = STUDIO.hours[wd];
                return (
                  <tr key={wd} data-today={today === wd}>
                    <th scope="row">{WEEK[i]}</th>
                    <td className="kr-num">{h ? `${h[0]}:00–${h[1]}:00` : "загружаем печь"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/** The room in plan. Units are decimetres; the whole studio is 14 by 8.6 metres. */
function Plan() {
  const wheels = Array.from({ length: STUDIO.wheels }, (_, i) => 16 + i * 17);
  return (
    <svg viewBox="-4 -6 148 104" className="kr-plan-svg" role="img" aria-label="План мастерской: шесть кругов вдоль окон, стол для лепки, глазуровочная, комната с печами, сушка, мойка и вход со двора">
      {/* Walls */}
      <path d="M0 0 H140 V86 H0 Z" className="kr-p-wall" />
      {/* Windows along the north wall */}
      {[10, 30, 50, 70, 90, 110].map((x) => (
        <g key={x}>
          <line x1={x} x2={x + 14} y1={0} y2={0} className="kr-p-gap" />
          <line x1={x} x2={x + 14} y1={-0.9} y2={-0.9} className="kr-p-window" />
          <line x1={x} x2={x + 14} y1={0} y2={0} className="kr-p-window" />
          <line x1={x} x2={x + 14} y1={0.9} y2={0.9} className="kr-p-window" />
        </g>
      ))}
      {/* The wheels, each with its stool */}
      {wheels.map((x, i) => (
        <g key={x} className="kr-p-wheel">
          <circle cx={x} cy={14} r={5.2} />
          <circle cx={x} cy={14} r={2.6} />
          <rect x={x - 2.4} y={22} width={4.8} height={4.8} rx={2.4} />
          <text x={x} y={33} className="kr-p-no">
            {i + 1}
          </text>
        </g>
      ))}
      {/* Hand-building table */}
      <rect x={30} y={44} width={44} height={14} className="kr-p-thing" />
      <text x={52} y={52.6} className="kr-p-label">
        лепка руками
      </text>
      {/* Glaze bench and sink */}
      <rect x={4} y={44} width={12} height={36} className="kr-p-thing" />
      <text x={10} y={63} className="kr-p-label kr-p-vert" transform="rotate(-90 10 62)">
        глазури
      </text>
      <rect x={20} y={74} width={12} height={8} className="kr-p-thing" />
      <circle cx={26} cy={78} r={2.4} className="kr-p-thin" />
      <text x={26} y={71.5} className="kr-p-label">
        мойка
      </text>
      {/* Drying shelves */}
      <g className="kr-p-shelf">
        <rect x={84} y={44} width={22} height={8} />
        {[88, 92, 96, 100].map((x) => (
          <line key={x} x1={x} x2={x} y1={44} y2={52} />
        ))}
      </g>
      <text x={95} y={57.5} className="kr-p-label">
        сушка
      </text>
      {/* Kiln room */}
      <path d="M112 40 H140 M112 40 V86" className="kr-p-wall-in" />
      <path d="M112 62 V70" className="kr-p-gap" />
      <rect x={118} y={46} width={14} height={14} className="kr-p-thing" />
      <circle cx={125} cy={53} r={4.4} className="kr-p-thin" />
      <rect x={118} y={68} width={14} height={14} className="kr-p-thing" />
      <circle cx={125} cy={75} r={4.4} className="kr-p-thin" />
      <text x={126} y={44} className="kr-p-label">
        печи, 1280 °C
      </text>
      {/* Entrance from the courtyard */}
      <path d="M58 86 H48" className="kr-p-gap" />
      <path d="M48 86 V96" className="kr-p-thin" />
      <path d="M58 86 A10 10 0 0 1 48 96" className="kr-p-door" />
      <text x={70} y={93} className="kr-p-label">
        вход со двора
      </text>
      {/* North */}
      <g transform="translate(134 -2)" className="kr-p-thin">
        <line x1={0} x2={0} y1={0} y2={-3.6} />
        <path d="M-1.2 -2.2 L0 -3.8 L1.2 -2.2" />
      </g>
    </svg>
  );
}
