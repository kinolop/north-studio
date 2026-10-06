import Link from "next/link";

/**
 * The foot of the page: the name at a size that fills it, what this is, and
 * who made it.
 *
 * «Круг» is an invented studio, so the only real contact here is the
 * studio's, set in the credit line where it reads as the maker's mark and
 * not as the pottery's telephone number.
 */
export function KrugFooter() {
  return (
    <footer className="kr-footer">
      <div className="kr-wrap">
        <p className="kr-footer-mark" aria-hidden>
          Круг
        </p>
        <div className="kr-footer-base">
          <p className="kr-footer-legal">
            Демо-концепт. Мастерской «Круг» не существует, адрес, цены и расписание условные. Чашка на круге,
            печь, полка и план мастерской нарисованы кодом, на странице нет ни одной фотографии.
          </p>
          <div className="kr-footer-credit">
            <Link href="/#work" className="kr-link">
              Вернуться в North Studio
            </Link>
            <a href="https://t.me/danilskrylev" target="_blank" rel="noreferrer noopener" className="kr-link">
              North Studio, Telegram @danilskrylev
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
