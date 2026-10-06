import { COFFEE, rub } from "@/lib/kotelnaya/data";

import { Photo, hasPhoto } from "./Photo";

/**
 * Coffee, as a short board: eight lines, dotted leaders to the price, the
 * way it is chalked above the counter. A photograph of a cup on the window
 * sill sits beside it when there is one.
 */
export function Coffee() {
  const pic = hasPhoto("coffee");
  return (
    <section id="coffee" className="kt-coffee" aria-labelledby="kt-coffee-title" data-pic={pic}>
      <div className="kt-wrap kt-coffee-grid">
        <div>
          <h2 id="kt-coffee-title" className="kt-h2">
            Кофе
          </h2>
          <p className="kt-head-note kt-coffee-note">
            Зерно обжаривают в двух кварталах отсюда, раз в неделю. Молоко можно заменить на овсяное, без доплаты.
          </p>
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
        {pic && (
          <figure className="kt-coffee-pic">
            <Photo slug="coffee" alt="Капучино и булочка с кардамоном на каменном подоконнике арочного окна" sizes="(max-width: 900px) 100vw, 40vw" />
          </figure>
        )}
      </div>
    </section>
  );
}
