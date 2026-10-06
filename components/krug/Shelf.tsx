import { WORKS, glazeById, rub } from "@/lib/krug/data";
import { cm, widest } from "@/lib/krug/profile";

import { VesselDrawing } from "./Drawing";

/**
 * Pots from the studio's own shelf, set out like a plate in a catalogue of
 * finds: a drawing, a number, the measurements and the glaze. Each is drawn
 * from the same four numbers as the reader's cup, so the shelf also shows
 * what the wheel can become with practice.
 */
export function Shelf() {
  return (
    <section id="shelf" className="kr-shelf" aria-labelledby="kr-shelf-title">
      <div className="kr-wrap">
        <header className="kr-head">
          <h2 id="kr-shelf-title" className="kr-h2">
            С&nbsp;полки мастерской
          </h2>
          <p className="kr-head-note">
            Посуда, которую делают мастера «Круга». Каждая вещь в одном экземпляре. Купить можно в мастерской или
            написать нам, отложим.
          </p>
        </header>

        <ul className="kr-plates">
          {WORKS.map((w) => {
            const g = glazeById(w.glaze);
            return (
              <li key={w.no} className="kr-plate">
                <VesselDrawing profile={w.profile} minBox={14} className="kr-plate-draw" title={w.name} />
                <div className="kr-plate-cap">
                  <p className="kr-plate-no kr-num">{w.no}</p>
                  <p className="kr-plate-name">{w.name}</p>
                  <p className="kr-plate-dims kr-num">
                    Ø {cm(widest(w.profile))} · В {cm(w.profile.lip.y)} см
                  </p>
                  <p className="kr-plate-glaze">
                    <span
                      className="kr-plate-chip"
                      style={{ background: `linear-gradient(180deg, ${g.thin}, ${g.base} 45%, ${g.pool})` }}
                      aria-hidden
                    />
                    {g.name}
                  </p>
                  <p className="kr-plate-price kr-num">{rub(w.price)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
