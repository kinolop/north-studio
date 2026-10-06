import Link from "next/link";

import { Photo } from "./Photo";

/**
 * The foot of the page, at dusk: the boiler house with its windows lit if
 * that photograph exists, the name, what this is and who made it.
 *
 * «Котельная» is an invented bakery, so the only real contact here is the
 * studio's, set in the credit line where it reads as the maker's mark.
 */
export function KotelnayaFooter() {
  return (
    <footer className="kt-footer">
      <Photo slug="dusk" alt="" sizes="100vw" className="kt-footer-photo" />
      <div className="kt-wrap kt-footer-in">
        <p className="kt-footer-mark" aria-hidden>
          Котельная
        </p>
        <div className="kt-footer-base">
          <p className="kt-footer-legal">
            Демо-концепт. Пекарни «Котельная» не существует, адрес, цены и расписание печи условные. Фотографии
            созданы для этого проекта, циферблат печи и всё остальное нарисовано кодом.
          </p>
          <div className="kt-footer-credit">
            <Link href="/#work" className="kt-link">
              Вернуться в North Studio
            </Link>
            <a href="https://t.me/danilskrylev" target="_blank" rel="noreferrer noopener" className="kt-link">
              North Studio, Telegram @danilskrylev
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
