"use client";

import { dayWord, num, priceDigits } from "@/lib/marshrut/format";
import type { Quote } from "@/lib/marshrut/model";

import { Roll } from "./Roll";
import { useQuote } from "./store";

/**
 * The two numbers the page exists to say, and how sure we are of the second.
 *
 * The price is per item, because that is the unit a marketplace seller
 * thinks in. The time is not one number: it is a median with a corridor
 * (four in five shipments arrive inside the darker bar, nineteen in twenty
 * inside the lighter one), because a promise of "21 days" that is met half
 * the time is worse than "21, usually, and here is how far it can slip".
 */

function Corridor({ d }: { d: Quote["days"] }) {
  // The axis runs over the range the shipment can take at all, not from zero,
  // so the bars use the width they have.
  const lo = Math.floor(d.min);
  const hi = Math.max(lo + 1, Math.ceil(d.max));
  const at = (v: number) => `${(((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * 100).toFixed(2)}%`;
  const span = (a: number, b: number) => `${((Math.max(0, b - a) / (hi - lo)) * 100).toFixed(2)}%`;
  return (
    <div className="mr-corridor" aria-hidden>
      <div className="mr-corridor-track" />
      <div className="mr-corridor-p95" style={{ left: at(d.p50), width: span(d.p50, d.p95) }} />
      <div className="mr-corridor-p80" style={{ left: at(d.p50), width: span(d.p50, d.p80) }} />
      <div className="mr-corridor-p50" style={{ left: at(d.p50) }} />
      <span className="mr-corridor-end mr-num" data-side="lo">
        {num(lo)}
      </span>
      <span className="mr-corridor-end mr-num" data-side="hi">
        {num(hi)}
      </span>
      <span className="mr-corridor-tick mr-num" style={{ left: at(d.p80) }} data-k="80">
        {num(Math.round(d.p80))}
      </span>
      <span className="mr-corridor-tick mr-num" style={{ left: at(d.p95) }} data-k="95">
        {num(Math.round(d.p95))}
      </span>
    </div>
  );
}

export function Ticket() {
  const q = useQuote();
  const price = num(q.perUnit, priceDigits(q.perUnit));
  const p50 = Math.round(q.days.p50);

  return (
    <aside className="mr-ticket" aria-label="Итог расчёта">
      <p className="mr-price mr-num" aria-live="polite">
        <Roll value={price} />
        <span className="mr-cur">{" "}₽</span>
      </p>
      <p className="mr-price-note">за штуку: перевозка, таможенное оформление, склад</p>

      <p className="mr-days mr-num" aria-live="polite">
        <Roll value={String(p50)} />
        <span className="mr-cur">
          {" "}
          {dayWord(p50)}
        </span>
      </p>
      <Corridor d={q.days} />
      <p className="mr-days-note">
        В 8 случаях из 10 до {num(Math.round(q.days.p80))}, в 19 из 20 до {num(Math.round(q.days.p95))}
      </p>

    </aside>
  );
}
