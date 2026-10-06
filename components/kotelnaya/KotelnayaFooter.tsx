import Link from "next/link";

import { PLACE } from "@/lib/kotelnaya/data";

import { NowLine } from "./NowLine";
import { Photo } from "./Photo";

/**
 * The end of the page is the courtyard again, at dusk, with every window
 * lit: the picture someone has in their head when they decide to go. Over
 * it, how to get to the door, then the name at the size of the building.
 *
 * «Котельная» is an invented bakery, so the only real contact here is the
 * studio's, set in the credit line where it reads as the maker's mark.
 */
export function KotelnayaFooter() {
  return (
    <footer id="visit" className="kt-footer" aria-labelledby="kt-visit-title">
      <figure className="kt-footer-photo" data-kt-speed="10">
        <Photo slug="dusk" alt="Котельная вечером: светятся арочные окна, мокрый булыжник двора" sizes="100vw" />
      </figure>
      <div className="kt-wrap kt-footer-in">
        <h2 id="kt-visit-title" className="kt-h2" data-kt-split>
          Как дойти
        </h2>
        <NowLine className="kt-now" />
        <dl className="kt-facts">
          <div>
            <dt>Адрес</dt>
            <dd>
              {PLACE.city}, {PLACE.address}
            </dd>
          </div>
          <div>
            <dt>Как найти</dt>
            <dd>{PLACE.findIt}</dd>
          </div>
          <div>
            <dt>Метро</dt>
            <dd>{PLACE.metro}</dd>
          </div>
          <div>
            <dt>Часы</dt>
            <dd>
              Каждый день <span className="kt-num">08:00–{PLACE.closes}:00</span>
              <br />
              <span className="kt-num">{PLACE.phone}</span>
            </dd>
          </div>
        </dl>

        <p className="kt-footer-mark" aria-hidden>
          Котельная
        </p>
        <div className="kt-footer-base">
          <p className="kt-footer-legal">
            Демо-концепт North Studio. Пекарни «Котельная» не существует, адрес, цены и расписание печи условные.
            Фотографии созданы для этого проекта, циферблат печи нарисован кодом.
          </p>
          <div className="kt-footer-credit">
            <Link href="/#work" className="kt-link">
              Вернуться в North Studio
            </Link>
            <a href="https://t.me/danilskrylev" target="_blank" rel="noreferrer noopener" className="kt-link">
              Telegram @danilskrylev
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
