"use client";

import { BAKES, PLACE, agoWords, bakeStates, breadById, clock, inWords } from "@/lib/kotelnaya/data";

import { useMoscowMinutes } from "./clock";

const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;

/**
 * The bakery's one sentence: what is warm right now and what comes next.
 * Read off the oven's timetable and Moscow's clock, so it is true whenever
 * it is read, including at night, when it says when the oven is lit.
 */
export function NowLine({ className }: { className?: string }) {
  const min = useMoscowMinutes();
  if (min === null) return <p className={className}>&nbsp;</p>;

  const states = bakeStates(min);
  const warmIdx = states.lastIndexOf("warm");
  const nextIdx = states.indexOf("next");
  const open = min >= PLACE.opens * 60 && min < PLACE.closes * 60;

  if (!open) {
    const first = BAKES[0]!;
    return (
      <p className={className} data-state="closed">
        <span className="kt-now-dot" aria-hidden />
        <span>
          Закрыто. Печь растапливаем в {hh(PLACE.ovenLit)}, первый {breadById(first.bread).name.toLowerCase()} в{" "}
          {clock(first.at)}, двери открываем в {hh(PLACE.opens)}.
        </span>
      </p>
    );
  }

  const warm = warmIdx >= 0 ? BAKES[warmIdx]! : null;
  const next = nextIdx >= 0 ? BAKES[nextIdx]! : null;
  return (
    <p className={className} data-state={warm ? "warm" : "cool"}>
      <span className="kt-now-dot" aria-hidden />
      <span>
        {warm ? (
          <>
            Сейчас из печи: <strong>{breadById(warm.bread).name.toLowerCase()}</strong>, {agoWords(min - warm.at)}.
          </>
        ) : (
          <>Тёплого сейчас нет, на полках утренняя выпечка.</>
        )}{" "}
        {next ? (
          <>
            Дальше {breadById(next.bread).name.toLowerCase()} в {clock(next.at)}, {inWords(next.at - min)}.
          </>
        ) : (
          <>Печь на сегодня закончила.</>
        )}
      </span>
    </p>
  );
}
