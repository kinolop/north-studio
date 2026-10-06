import { COFFEE, rub } from "@/lib/kotelnaya/data";

import { Photo } from "./Photo";

/**
 * Coffee, set on the window sill it is drunk at. The photograph takes the
 * whole screen and the board is chalked over its dark side: eight lines,
 * dotted leaders to the price, the way it hangs over the counter.
 */
export function Coffee() {
  return (
    <section id="coffee" className="kt-coffee" aria-labelledby="kt-coffee-title">
      <figure className="kt-coffee-pic" data-kt-speed="12">
        <Photo
          slug="coffee"
          alt="Капучино и булочка с кардамоном на каменном подоконнике арочного окна, за стеклом двор"
          sizes="100vw"
        />
      </figure>
      <div className="kt-wrap kt-coffee-in">
        <div className="kt-coffee-board">
          <h2 id="kt-coffee-title" className="kt-h2" data-kt-split>
            Кофе
          </h2>
          <p className="kt-lead">Зерно обжаривают в двух кварталах отсюда. Овсяное молоко без доплаты.</p>
          <ul className="kt-board">
            {COFFEE.map((c) => (
              <li key={c.name}>
                <span className="kt-board-name">
                  {c.name}
                  {c.note && <small>{c.note}</small>}
                </span>
                <span className="kt-board-dots" aria-hidden />
                <span className="kt-board-price kt-num">{rub(c.price)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
