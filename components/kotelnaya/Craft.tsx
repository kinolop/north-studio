import { Photo } from "./Photo";

/**
 * How the bread is made, as a spread rather than a list: four photographs
 * at different sizes and depths, and three plain facts set large between
 * them. The photographs drift at different speeds as the page passes, so
 * the spread reads as layers on a table rather than a grid.
 */
export function Craft() {
  return (
    <section className="kt-craft" aria-labelledby="kt-craft-title">
      <div className="kt-wrap kt-craft-grid">
        <h2 id="kt-craft-title" className="kt-h2 kt-craft-title" data-kt-split>
          Как мы печём
        </h2>

        <figure className="kt-craft-a" data-kt-speed="14">
          <Photo slug="hands" alt="Руки пекаря формуют круглый хлеб на столе в муке" sizes="(min-width: 900px) 58vw, 100vw" />
        </figure>
        <p className="kt-fact kt-craft-f1">
          Закваске девять лет. Её кормят дважды в день, и в праздники тоже.
        </p>

        <figure className="kt-craft-b" data-kt-speed="-10">
          <Photo slug="rye" alt="Треснувшая корка ржаного хлеба в муке, крупно" sizes="(min-width: 900px) 34vw, 100vw" />
        </figure>
        <figure className="kt-craft-c" data-kt-speed="18">
          <Photo slug="croissants" alt="Противень круассанов, только из печи, на мраморном столе" sizes="(min-width: 900px) 40vw, 100vw" />
        </figure>
        <p className="kt-fact kt-craft-f2">
          Тесто для багета стоит ночь в холоде. Поэтому корка трещит, а мякиш в крупных дырах.
        </p>

        <figure className="kt-craft-d" data-kt-speed="8">
          <Photo slug="shelves" alt="Деревянные полки с ржаным хлебом и багетами в плетёных корзинах" sizes="100vw" />
        </figure>
        <p className="kt-fact kt-craft-f3">
          К вечеру полки пустеют. Что осталось, в девять отдаём за полцены или везём в приют на Лесном.
        </p>
      </div>
    </section>
  );
}
