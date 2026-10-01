"use client";

import { useCallback } from "react";

import {
  DESTINATIONS,
  MODES,
  ORIGINS,
  PRODUCTS,
  byId,
  type DestId,
  type ModeId,
  type OriginId,
  type ProductId,
} from "@/lib/marshrut/data";
import { days, num, plural, priceDigits, rub } from "@/lib/marshrut/format";

import { Choice, NumberField, type Option } from "./Fields";
import { calc, quoteOf, useInput } from "./store";

/**
 * The calculator, written as a sentence.
 *
 *   Довезём 3 200 футболок из Гуанчжоу на склад в Коледине поездом.
 *
 * Every underlined word is a control. The list under each one shows what
 * the shipment would cost with that word swapped, so choosing is comparing:
 * you do not open a mode to find out what it means, you read what it does to
 * your own cargo.
 */
export function Sentence() {
  const input = useInput();
  const product = byId(PRODUCTS, input.product);
  const origin = byId(ORIGINS, input.origin);
  const dest = byId(DESTINATIONS, input.dest);
  const mode = byId(MODES, input.mode);

  const price = (p: number) => rub(p, priceDigits(p));

  const products = useCallback(
    (): Option<ProductId>[] =>
      PRODUCTS.map((p) => {
        const q = quoteOf({ ...input, product: p.id });
        return {
          id: p.id,
          label: p.name,
          meta: `${num(Math.round(q.density))} кг/м³ · ${price(q.perUnit)}`,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input],
  );

  const origins = useCallback(
    (): Option<OriginId>[] =>
      ORIGINS.map((o) => {
        const q = quoteOf({ ...input, origin: o.id });
        return { id: o.id, label: o.name, meta: `${price(q.perUnit)} · ${days(q.days.p50)}` };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input],
  );

  const dests = useCallback(
    (): Option<DestId>[] =>
      DESTINATIONS.map((d) => {
        const q = quoteOf({ ...input, dest: d.id });
        return { id: d.id, label: `${d.name}, ${d.region}`, meta: `${price(q.perUnit)} · ${days(q.days.p50)}` };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input],
  );

  const modes = useCallback(
    (): Option<ModeId>[] =>
      MODES.map((m) => {
        const q = quoteOf({ ...input, mode: m.id });
        return {
          id: m.id,
          label: m.name,
          meta: (
            <>
              {price(q.perUnit)} · {days(q.days.p50)}
            </>
          ),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input],
  );

  return (
    <h1 className="mr-sentence">
      <span className="mr-w">Довезём </span>
      <NumberField
        label="Сколько штук"
        value={input.units}
        min={100}
        max={30000}
        onChange={(units) => calc.set({ units })}
      />{" "}
      <Choice
        label="Товар"
        text={plural(input.units, product.forms)}
        value={input.product}
        options={products}
        onChange={(id) => calc.set({ product: id })}
      />
      <span className="mr-w"> из </span>
      <Choice
        label="Откуда"
        text={origin.from}
        value={input.origin}
        options={origins}
        onChange={(id) => calc.set({ origin: id })}
      />
      <span className="mr-w"> на склад в </span>
      <Choice
        label="Куда"
        text={dest.prep}
        value={input.dest}
        options={dests}
        onChange={(id) => calc.set({ dest: id })}
        wide
      />{" "}
      <Choice
        label="Как везти"
        text={mode.by}
        value={input.mode}
        options={modes}
        onChange={(id) => calc.set({ mode: id })}
      />
      <span className="mr-w">.</span>
    </h1>
  );
}
