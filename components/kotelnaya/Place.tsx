import { Photo, hasPhoto } from "./Photo";

const YEARS = [
  {
    year: "1912",
    body: "Котельную построили для ткацкой фабрики. Два котла, труба в тридцать два метра, уголь подвозили по рельсам прямо во двор.",
  },
  {
    year: "1990-е",
    body: "Фабрика встала, котлы ушли на металлолом. Трубу оставили: снести её стоило дороже, чем оставить.",
  },
  {
    year: "2023",
    body: "Мы поставили каменную печь там, где стояли котлы, и открыли окна, заложенные кирпичом в пятидесятых.",
  },
] as const;

const DETAILS = [
  { slug: "oven", alt: "Пекарь вынимает ржаной хлеб из каменной печи на деревянной лопате" },
  { slug: "rye", alt: "Треснувшая корка ржаного хлеба в муке, крупно" },
  { slug: "croissants", alt: "Противень круассанов, только из печи, на мраморном столе в муке" },
  { slug: "gauge", alt: "Старый латунный манометр на побелённой кирпичной стене" },
  { slug: "hands", alt: "Руки пекаря формуют круглый хлеб на столе в муке" },
  { slug: "shelves", alt: "Деревянные полки с ржаным хлебом и багетами в льняных корзинах" },
] as const;

/**
 * The building, which is half of why people come. The hall under its brick
 * vault, then its three dates. Dates are the only numbering on the page
 * that means something, so they are the only numbering here.
 */
export function Place() {
  const details = DETAILS.filter((d) => hasPhoto(d.slug)).slice(0, 3);
  return (
    <section id="place" className="kt-place" aria-labelledby="kt-place-title">
      <figure className="kt-place-hall">
        <Photo
          slug="hall"
          alt="Зал пекарни под кирпичным сводом: длинные дубовые столы, свет из арочных окон, в глубине каменная печь и пекарь"
          sizes="100vw"
        />
      </figure>
      <div className="kt-wrap">
        <header className="kt-head">
          <h2 id="kt-place-title" className="kt-h2">
            Место
          </h2>
          <p className="kt-head-note">
            Сто двадцать мест под сводом, длинные столы на шестерых, розетки у каждого окна. С ноутбуком можно, с
            собакой тоже.
          </p>
        </header>
        <ol className="kt-years">
          {YEARS.map((y) => (
            <li key={y.year}>
              <p className="kt-year kt-num">{y.year}</p>
              <p>{y.body}</p>
            </li>
          ))}
        </ol>
        {details.length > 0 && (
          <div className="kt-details" data-count={details.length}>
            {details.map((d) => (
              <figure key={d.slug}>
                <Photo slug={d.slug} alt={d.alt} sizes="(max-width: 700px) 100vw, 33vw" />
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
