import { Photo } from "./Photo";

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

/**
 * The building's three dates beside the one thing left from its first
 * life: the boiler's pressure gauge, still on the wall by the oven. The
 * photograph stays put while the dates pass it. Dates are the only
 * numbering on the page that says something, so they are set large.
 */
export function Place() {
  return (
    <section id="place" className="kt-place" aria-labelledby="kt-place-title">
      <div className="kt-wrap kt-place-grid">
        <figure className="kt-place-pic" data-kt-reveal>
          <Photo
            slug="gauge"
            alt="Старый манометр котла и ржавая труба на побелённой кирпичной стене"
            sizes="(min-width: 900px) 42vw, 100vw"
          />
        </figure>
        <div className="kt-place-text">
          <h2 id="kt-place-title" className="kt-h2" data-kt-split>
            Сто лет здесь грели воду
          </h2>
          <ol className="kt-years">
            {YEARS.map((y) => (
              <li key={y.year}>
                <p className="kt-year">{y.year}</p>
                <p>{y.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
