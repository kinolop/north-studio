"use client";

import { useState } from "react";

import { dayAt } from "@/lib/marshrut/timeline";

import { Chapter } from "../Chapter";
import { Diary } from "../Diary";
import { useMoment } from "../moment";
import { useQuote } from "../store";

/**
 * Chapter five, the last stretch: the questions a marketplace seller asks
 * before the first shipment, in the order they are usually asked.
 *
 * This is the one chapter that is not pinned. Its answers open and close, so
 * it scrolls like a page, and the camera follows the cargo across Russia as
 * it does: reading the questions is the drive to the warehouse.
 *
 * Built on `details`, so keyboards, find-in-page and screen readers behave
 * as they do everywhere else, and the open state is the browser's own.
 */

const QUESTIONS: { q: string; a: string }[] = [
  {
    q: "А если груз арестуют на границе?",
    a: "Арестовывают то, что везут без документов. Мы ввозим официально: инвойс, декларация, пошлина и НДС уплачены, коды ТН ВЭД согласованы с вами до отправки. На руках у вас бумаги, которые примет и маркетплейс, и налоговая.",
  },
  {
    q: "Сколько уйдёт государству, а сколько вам?",
    a: "Это две разные строки. Пошлина и НДС считаются по декларации и видны в накладной отдельно; наша цена за перевозку и оформление идёт своей строкой. НДС можно принять к вычету, если вы его плательщик.",
  },
  {
    q: "Почему худи везти дороже, чем кружки?",
    a: "Фура заполняется объёмом раньше, чем весом, и перевозчик берёт за место. Худи лёгкие и объёмные: килограмм выходит дороже. Плотнее упаковать короб значит удешевить каждую штуку.",
  },
  {
    q: "Примут ли на склад без «Честного знака»?",
    a: "Одежду, обувь и другие товары с обязательной маркировкой без кодов не примут. Коды можно нанести ещё на складе в Китае или в России, до отгрузки на маркетплейс. Назовите категорию, и мы скажем, сколько это добавит по сроку и цене.",
  },
  {
    q: "Что, если груз опоздает?",
    a: "Пишем в тот же день, когда меняется прогноз, а не когда срок уже прошёл. Если груз задержится дольше, чем в девятнадцати случаях из двадцати, возвращаем часть стоимости перевозки.",
  },
  {
    q: "Кто записывает поставку на приёмку?",
    a: "Мы. Бронируем слот на складе маркетплейса заранее, проверяем штрихкоды и упаковку ещё в Китае, чтобы приёмка не развернула паллету, и присылаем акт в день сдачи.",
  },
];

export function Faq() {
  const q = useQuote();
  const [open, setOpen] = useState<number | null>(0);
  const gateKm = q.route.legs[0].km + q.route.legs[1].km / 2;
  // The entry keeps the header's day while the chapter is read, so the two never disagree.
  const live = useMoment((m) => (m.chapter === 5 ? Math.floor(m.day + 1e-6) : 0), 0);
  const day = Math.max(dayAt(q, q.route.legs[2].s0), live);

  return (
    <Chapter
      id="faq"
      index={5}
      km={gateKm}
      place={`${q.route.gate.name} → ${q.route.dest.name}`}
      pin={false}
      className="mr-faq"
    >
      <Diary day={day}>
        Граница позади, впереди {q.route.dest.name}.
      </Diary>
      <h2 className="mr-h2" id="faq-title">
        Пока груз в пути: что обычно спрашивают перед первой поставкой
      </h2>
      <div className="mr-faq-list">
        {QUESTIONS.map((item, i) => (
          <details
            key={item.q}
            open={open === i}
            onToggle={(e) => {
              const isOpen = (e.currentTarget as HTMLDetailsElement).open;
              if (isOpen) setOpen(i);
              else if (open === i) setOpen(null);
            }}
          >
            <summary>
              <span className="mr-faq-n mr-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="mr-faq-q">{item.q}</span>
              <i aria-hidden />
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </Chapter>
  );
}
