"use client";

import { PLACE } from "@/lib/kotelnaya/data";

import { NowLine } from "./NowLine";

/**
 * How to get to the door, which is the one thing a courtyard place has to
 * explain. The chimney is the landmark, so the directions start from it.
 */
export function Visit() {
  return (
    <section id="visit" className="kt-visit" aria-labelledby="kt-visit-title">
      <div className="kt-wrap kt-visit-grid">
        <div>
          <h2 id="kt-visit-title" className="kt-h2">
            Как дойти
          </h2>
          <NowLine className="kt-now kt-visit-now" />
        </div>
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
              Каждый день, <span className="kt-num">08:00–{PLACE.closes}:00</span>. Завтраки до полудня.
            </dd>
          </div>
          <div>
            <dt>Телефон</dt>
            <dd className="kt-num">{PLACE.phone}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
