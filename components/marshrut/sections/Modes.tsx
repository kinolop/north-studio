"use client";

import { DESTINATIONS, MODES, ORIGINS, byId, type ModeId } from "@/lib/marshrut/data";
import { days, num, plural, priceDigits, rub } from "@/lib/marshrut/format";

import { Chapter } from "../Chapter";
import { Diary } from "../Diary";
import { useEngine } from "../engineStore";
import { Flap } from "../Flap";
import { useMoment } from "../moment";
import { calc, quoteOf, useInput } from "../store";

/**
 * Chapter two, above the continent: four ways from the same warehouse.
 *
 * All four routes are on the map at once. The panel is a departures board,
 * one line per way to go, every figure computed for the reader's own cargo:
 * how many days it usually takes, how late it can be in nineteen cases out
 * of twenty, what it comes to per item. Pointing at a line lights its route
 * on the map; choosing one sends the whole page by that route.
 */

const BOARD: Record<ModeId, string> = { road: "Фура", rail: "Поезд", sea: "Море+жд", air: "Авиа" };

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * The chapter's headline is the choice itself, said in the reader's numbers:
 * the chosen way, and against it the alternative that matters most (the
 * cheapest of the faster ways, or, when nothing is faster, the cheapest).
 */
function verdict(rows: { mode: (typeof MODES)[number]; q: ReturnType<typeof quoteOf> }[], current: ModeId) {
  const mine = rows.find((r) => r.mode.id === current)!;
  const others = rows.filter((r) => r.mode.id !== current);
  const faster = others.filter((r) => r.q.days.p50 < mine.q.days.p50 - 0.5);
  const fastest = faster.length ? faster.reduce((a, b) => (b.q.perUnit < a.q.perUnit ? b : a)) : null;
  const cheapest = others.reduce((a, b) => (b.q.perUnit < a.q.perUnit ? b : a));
  const price = (v: number) => rub(v, priceDigits(v));
  const first = `${cap(mine.mode.by)} — ${days(mine.q.days.p50)} и ${price(mine.q.perUnit)} за штуку.`;
  if (fastest) {
    const dd = Math.round(mine.q.days.p50 - fastest.q.days.p50);
    const more = fastest.q.perUnit - mine.q.perUnit;
    return `${first} ${fastest.mode.name} на ${days(dd)} быстрее${more > 0 ? `, но дороже на ${price(more)}` : ""}.`;
  }
  const saved = mine.q.perUnit - cheapest.q.perUnit;
  if (saved <= 0) return `${first} Быстрее и дешевле этого пути нет.`;
  const longer = Math.round(cheapest.q.days.p50 - mine.q.days.p50);
  return `${first} ${cheapest.mode.name} дешевле на ${price(saved)}, но дольше на ${days(longer)}.`;
}

export function Modes() {
  const engine = useEngine();
  const input = useInput();
  const origin = byId(ORIGINS, input.origin);
  const dest = byId(DESTINATIONS, input.dest);
  const current = quoteOf(input);
  const rows = MODES.map((m) => ({ mode: m, q: quoteOf({ ...input, mode: m.id }) }));
  const play = useMoment((m) => m.chapter >= 2, false);

  const preview = (mode: ModeId | null) => () => engine?.previewMode(mode === input.mode ? null : mode);

  return (
    <Chapter id="modes" index={2} km={0} place={`${origin.name}: четыре отправления`}>
      <Diary day={0} time="17:20">
        {origin.name}, отправления на сегодня.
      </Diary>
      <h2 className="mr-h2 mr-h2-small" id="modes-title">
        {verdict(rows, input.mode)}
      </h2>
      <p className="mr-lede">
        Посчитано на {num(input.units)} {plural(input.units, current.product.forms)} до склада в {dest.prep}. Наведите на
        строку табло, и путь загорится на карте. Выберите, и вся история дальше поедет им.
      </p>

      <div className="mr-board">
        <div className="mr-board-head" aria-hidden>
          <span>Отправление</span>
          <span>В пути</span>
          <span>19 из 20</span>
          <span>₽ за шт</span>
        </div>
        <div className="mr-board-rows" role="radiogroup" aria-label="Способ доставки" onPointerLeave={preview(null)}>
          {rows.map(({ mode, q }) => (
            <button
              key={mode.id}
              type="button"
              role="radio"
              aria-checked={input.mode === mode.id}
              className="mr-board-row"
              onPointerEnter={preview(mode.id)}
              onFocus={preview(mode.id)}
              onBlur={preview(null)}
              onClick={() => {
                engine?.previewMode(null);
                calc.set({ mode: mode.id });
              }}
            >
              <span className="mr-board-name">
                <Flap text={BOARD[mode.id]} cells={7} play={play} />
                <small>{mode.note}</small>
              </span>
              <Flap text={`${num(Math.round(q.days.p50))} дн`} cells={5} play={play} align="right" />
              <Flap text={`до ${num(Math.round(q.days.p95))}`} cells={5} play={play} align="right" />
              <Flap text={num(q.perUnit, priceDigits(q.perUnit))} cells={5} play={play} align="right" />
            </button>
          ))}
        </div>
      </div>

    </Chapter>
  );
}
