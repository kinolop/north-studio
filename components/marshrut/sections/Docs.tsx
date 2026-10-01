"use client";

import type { ModeId, ProductId } from "@/lib/marshrut/data";
import { DESTINATIONS, byId } from "@/lib/marshrut/data";
import { days, num } from "@/lib/marshrut/format";
import { dayAt, legDays } from "@/lib/marshrut/timeline";

import { Chapter } from "../Chapter";
import { Diary } from "../Diary";
import { XRay } from "../XRay";
import { StampMark } from "../Journey";
import { useMoment } from "../moment";
import { useQuote } from "../store";

/**
 * Chapter four, at the border: the paper that travels with the cargo.
 *
 * The camera closes in on the crossing and holds there while the reader
 * scrolls, because at the border the cargo holds too. In the panel, the
 * consignment note for the reader's own shipment, laid out the way the real
 * form is and filled from the same calculation as everything else on the
 * page: its boxes fill in one after another as the page is scrolled, the
 * attached documents are checked off, and then the release stamp comes down,
 * on the note and on the map at the crossing, at the same moment.
 */

const SHIPPER: Record<ProductId, string> = {
  tshirt: "Huayi Garments Co., Ltd",
  hoodie: "Fengyi Knitwear Co., Ltd",
  sneakers: "Xinyuan Footwear Co., Ltd",
  mug: "Yueshan Ceramics Co., Ltd",
  plush: "Meiyi Toys Co., Ltd",
  case: "Ruiting Electronics Co., Ltd",
};

const FORM: Record<ModeId, { title: string; code: string }> = {
  road: { title: "Международная товарно-транспортная накладная", code: "CMR" },
  rail: { title: "Накладная международного железнодорожного сообщения", code: "СМГС" },
  sea: { title: "Коносамент и накладная СМГС", code: "B/L" },
  air: { title: "Авианакладная", code: "AWB" },
};

const CITY_EN: Record<string, string> = { guangzhou: "Guangzhou", yiwu: "Yiwu", shanghai: "Shanghai" };

function Box({
  n,
  label,
  children,
  span,
  filled,
}: {
  n: string;
  label: string;
  children: React.ReactNode;
  span?: string;
  filled: boolean;
}) {
  return (
    <div className="mr-cmr-box" data-span={span}>
      <span className="mr-cmr-n">{n}</span>
      <span className="mr-cmr-label">{label}</span>
      <div className="mr-cmr-value" data-filled={filled}>
        {children}
      </div>
    </div>
  );
}

export function Docs() {
  const q = useQuote();
  const dest = byId(DESTINATIONS, q.input.dest);
  const form = FORM[q.input.mode];
  const city = CITY_EN[q.input.origin] ?? "Guangzhou";

  // First the scanner, then the paperwork: which of the two is on the plate, and how far the note has got.
  const step = useMoment((m) => (m.chapter > 4 ? 40 : m.chapter === 4 ? Math.floor(m.local * 40) : 0), 0);
  const paper = step >= 19;
  const stamped = useMoment((m) => m.stamp > 0.5 || m.chapter > 4, false);
  const fill = (i: number) => step >= 20 + i * 1.3;

  const [, d1] = legDays(q);
  const gateDay = dayAt(q, q.route.gate.s);
  // While the chapter is read the entry follows the header's day; seen from elsewhere it is the day at the gate.
  const live = useMoment((m) => (m.chapter === 4 ? Math.floor(m.day + 1e-6) : -1), -1);
  const customs = days(Math.max(1, Math.round(d1)));
  const queue = days(Math.round(d1 + 4));
  const headline =
    q.input.mode === "sea"
      ? `Во Владивостоке контейнер снимают с судна за сутки. Таможня занимает ${customs}`
      : q.input.mode === "air"
        ? `В аэропорту груз встречает наш брокер. Таможня занимает ${customs}`
        : `На переходе очередь на ${queue}. ${q.input.mode === "road" ? "Наша фура" : "Наш контейнер"} проходит за ${customs}`;

  return (
    <Chapter
      id="docs"
      index={4}
      km={q.route.legs[0].km}
      place={q.route.gate.name}
      wide
      className="mr-docs"
    >
      <Diary day={live >= 0 ? live : gateDay} time="06:10">
        {q.route.gate.name}, таможенный пост.
      </Diary>
      <h2 className="mr-h2 mr-h2-small" id="docs-title">
        {headline}
      </h2>
      <p className="mr-lede">
        Декларацию мы подали, пока груз был в пути. На границе остаётся просветить контейнер, сверить пломбу и
        поставить штамп.
      </p>

      <div className="mr-border-plate" data-phase={paper ? "paper" : "scan"}>
      <XRay q={q} place={q.route.gate.name} time="06:14" />
      <article className="mr-cmr" aria-label={`${form.code} для вашей отправки`} data-stamped={stamped}>
        <header className="mr-cmr-head">
          <div>
            <b className="mr-cmr-code">{form.code}</b>
            <span className="mr-cmr-title">{form.title}</span>
          </div>
          <div className="mr-cmr-no mr-num">
            <span>№</span> MR-0417
            <em>экземпляр 2, получателю</em>
          </div>
        </header>
        <div className="mr-cmr-grid">
          <Box n="1" label="Отправитель" filled={fill(0)}>
            {SHIPPER[q.input.product]}, {city}
          </Box>
          <Box n="2" label="Получатель" filled={fill(1)}>
            ИП Ветрова Е. С., Россия
          </Box>
          <Box n="3" label="Место разгрузки" filled={fill(2)}>
            {dest.name}, {dest.region}
          </Box>
          <Box n="7" label="Мест" filled={fill(3)}>
            <span className="mr-num">
              {num(q.cartons)} кор. / {num(q.pallets.pallets)} пал.
            </span>
          </Box>
          <Box n="9" label="Наименование груза" span="2" filled={fill(4)}>
            {q.product.goods}
          </Box>
          <Box n="10" label="ТН ВЭД" filled={fill(5)}>
            {q.product.hs}
          </Box>
          <Box n="11" label="Брутто, кг" filled={fill(6)}>
            <span className="mr-num">{num(Math.round(q.kg))}</span>
          </Box>
          <Box n="12" label="Объём, м³" filled={fill(7)}>
            <span className="mr-num">{num(q.m3, 2)}</span>
          </Box>
          <Box n="18" label="Пломба" span="2" filled={fill(8)}>
            MR 5510 3382
          </Box>
          <Box n="6" label="Знаки и номера" filled={fill(8)}>
            <span className="mr-num">MR-0417 / 1-{num(q.cartons)}</span>
          </Box>
          <Box n="21" label="Оформление" span="3" filled={fill(9)}>
            {q.route.gate.name}. Пошлина и НДС <span className="mr-num">{num(q.taxes.perUnit, 1)}</span> ₽ на штуку,
            отдельной строкой.
          </Box>
        </div>
        <div className="mr-cmr-stamp" aria-hidden>
          <StampMark id="doc" />
        </div>
        <p className="mr-sr">{stamped ? "Выпуск разрешён" : "Документы проверяются"}</p>
      </article>

      </div>
    </Chapter>
  );
}
