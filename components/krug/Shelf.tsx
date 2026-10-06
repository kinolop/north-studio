import { WORKS, glazeById, rub, type Work } from "@/lib/krug/data";
import { cm, outerWall, widest } from "@/lib/krug/profile";

import { VesselDrawing } from "./Drawing";

const GAP = 6;
const ROWS: readonly (readonly Work[])[] = [WORKS.slice(0, 4), WORKS.slice(4, 8)];

const half = (w: Work) => Math.max(...outerWall(w.profile, 64).map(([r]) => r));
/** Width a pot takes on the shelf, in centimetres, with its drawing margin. */
const span = (w: Work) => half(w) * 2 + 0.6;
const rowSpan = (row: readonly Work[]) => row.reduce((sum, w) => sum + Math.max(span(w), 11), 0) + GAP * (row.length - 1);
/** One scale for both shelves, set by the longer of them. */
const SCALE_SPAN = Math.max(...ROWS.map(rowSpan));
const TALLEST = Math.max(...WORKS.map((w) => w.profile.lip.y)) + 0.4;

/**
 * The studio's own shelf, drawn to one scale: every pot stands on the same
 * plank at its real size relative to the others, so an espresso cup looks
 * like an espresso cup beside a dish. Each is coloured with its glaze on
 * the outside and cut in section on the inside, and labelled underneath
 * the way the studio labels its stock.
 */
export function Shelf() {
  return (
    <section id="shelf" className="kr-shelf" aria-labelledby="kr-shelf-title">
      <div className="kr-wrap">
        <div className="kr-section-head">
          <h2 id="kr-shelf-title" className="kr-h2">
            С полки мастерской
          </h2>
          <p className="kr-lead">
            Посуда, которую делают мастера «Круга», нарисованная в одном масштабе. Каждая вещь в одном экземпляре, купить
            можно в мастерской.
          </p>
        </div>

        {ROWS.map((row, r) => (
          <div
            key={r}
            className="kr-shelf-row"
            style={{ "--span": SCALE_SPAN, "--tall": TALLEST } as React.CSSProperties}
          >
            <ul className="kr-shelf-plank">
              {row.map((w) => {
                const g = glazeById(w.glaze);
                return (
                  <li key={w.no} className="kr-pot" style={{ "--slot": Math.max(span(w), 11) } as React.CSSProperties}>
                    <div className="kr-pot-fig">
                      <VesselDrawing profile={w.profile} glaze={g} exact className="kr-pot-draw" title={w.name} />
                    </div>
                    <div className="kr-pot-cap">
                      <p className="kr-pot-no kr-num">{w.no}</p>
                      <p className="kr-pot-name">{w.name}</p>
                      <p className="kr-pot-dims kr-num">
                        Ø {cm(widest(w.profile))}, В {cm(w.profile.lip.y)} см
                      </p>
                      <p className="kr-pot-glaze">{g.name}</p>
                      <p className="kr-pot-price kr-num">{rub(w.price)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
