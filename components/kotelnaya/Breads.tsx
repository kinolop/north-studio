"use client";

import { BAKES, BREADS, clock, rub } from "@/lib/kotelnaya/data";

import { basketStore, useBasket } from "./basket";
import { Photo, hasPhoto } from "./Photo";

/**
 * The six things the oven makes, each photographed on the same slab of
 * grey stone in the same window light, so the row reads as one shelf.
 * Under each, when it comes out of the oven, and a button that puts it
 * into the pre-order further down.
 */
export function Breads() {
  const basket = useBasket();

  return (
    <section id="bread" className="kt-bread" aria-labelledby="kt-bread-title">
      <div className="kt-wrap">
        <header className="kt-head">
          <h2 id="kt-bread-title" className="kt-h2">
            Хлеб
          </h2>
          <p className="kt-head-note">
            Шесть позиций, зато каждый день одинаково хорошо. Муку берём у мельницы под Псковом, масло у фермы в
            Ленобласти.
          </p>
        </header>

        <ul className="kt-loaves">
          {BREADS.map((b) => {
            const times = BAKES.filter((x) => x.bread === b.id).map((x) => clock(x.at));
            const count = basket[b.id] ?? 0;
            return (
              <li key={b.id} className="kt-loaf">
                <div className="kt-loaf-pic" data-empty={!hasPhoto(b.photo)}>
                  <Photo slug={b.photo} alt={b.name} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" />
                  {!hasPhoto(b.photo) && (
                    <span className="kt-loaf-type" aria-hidden>
                      {b.name}
                    </span>
                  )}
                </div>
                <div className="kt-loaf-cap">
                  <h3 className="kt-h3">{b.name}</h3>
                  <p className="kt-loaf-price kt-num">{rub(b.price)}</p>
                  <p className="kt-loaf-meta">
                    <span className="kt-num">{b.weight}</span> · из печи в{" "}
                    <span className="kt-num">{times.join(" и ")}</span>
                  </p>
                  <p className="kt-loaf-body">{b.body}</p>
                  <button
                    type="button"
                    className="kt-loaf-add"
                    onClick={() => basketStore.add(b.id, 1)}
                    aria-label={`Отложить: ${b.name}`}
                  >
                    {count > 0 ? `Отложено: ${count}` : "Отложить"}
                    <span aria-hidden>+</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
