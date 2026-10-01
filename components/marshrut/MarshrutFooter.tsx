import Link from "next/link";

/**
 * The foot of the page: the name at a size that fills it, what this is, and
 * who made it.
 *
 * "Маршрут" is an invented company, so the only real contact here is the
 * studio's, set in the credit line where it reads as the maker's mark and
 * not as the cargo company's telephone number.
 */
export function MarshrutFooter() {
  return (
    <footer className="mr-footer">
      <div className="mr-wrap">
        <p className="mr-footer-mark" aria-hidden>
          Маршрут
        </p>
        <div className="mr-footer-base">
          <p className="mr-footer-legal">
            Демо-концепт. Компании «Маршрут» не существует, тарифы, сроки и документы условные. Карта, коробки,
            фура и каждая линия на странице нарисованы кодом.
          </p>
          <div className="mr-footer-credit">
            <Link href="/#work" className="mr-link">
              Вернуться в North Studio
            </Link>
            <a href="https://t.me/danilskrylev" target="_blank" rel="noreferrer noopener" className="mr-link">
              North Studio, Telegram @danilskrylev
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
