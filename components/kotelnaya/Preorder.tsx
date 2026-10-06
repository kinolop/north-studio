"use client";

import { useMemo, useState, type FormEvent } from "react";

import { BAKES, BREADS, PLACE, WARM_MIN, clock, rub, type BreadId } from "@/lib/kotelnaya/data";

import { basketStore, useBasket } from "./basket";
import { useMoscowMinutes } from "./clock";

const CONTACT = /^(@[\w]{4,}|\+?[\d\s()-]{10,})$/;

type Status = "idle" | "sending" | "sent";

/** Pick-up times: every half hour from half an hour from now to half an hour before closing; tomorrow if that is none. */
function pickups(min: number): { at: number; tomorrow: boolean }[] {
  const open = PLACE.opens * 60 + 30;
  const last = PLACE.closes * 60 - 30;
  const from = Math.max(open, Math.ceil((min + 30) / 30) * 30);
  const out: { at: number; tomorrow: boolean }[] = [];
  for (let t = from; t <= last; t += 30) out.push({ at: t, tomorrow: false });
  if (out.length === 0) for (let t = open; t <= last; t += 30) out.push({ at: t, tomorrow: true });
  return out;
}

/** Whether a bread will still be warm at a given pick-up time. */
const warmAt = (id: BreadId, at: number) => BAKES.some((b) => b.bread === id && at - b.at >= 0 && at - b.at <= WARM_MIN);

/**
 * Setting bread aside: how many of what, for what time, in whose name. The
 * bakery signs the bag and keeps it at the till. When a bread comes out of
 * the oven just before the chosen half-hour, the form says it will be warm,
 * which is the whole reason to choose the time. A demonstration: it sends
 * nothing, but has every state a real form would.
 */
export function Preorder() {
  const basket = useBasket();
  const min = useMoscowMinutes();
  const slots = useMemo(() => (min === null ? [] : pickups(min)), [min]);
  const [at, setAt] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const chosen = slots.find((s) => s.at === at) ?? null;
  const items = BREADS.filter((b) => (basket[b.id] ?? 0) > 0);
  const total = items.reduce((sum, b) => sum + b.price * (basket[b.id] ?? 0), 0);

  const emptyError = tried && items.length === 0 ? "Добавьте хотя бы один хлеб." : "";
  const timeError = tried && !chosen ? "Выберите, к какому времени отложить." : "";
  const nameError = tried && name.trim().length < 2 ? "На чьё имя подписать пакет?" : "";
  const contactError =
    tried && !CONTACT.test(contact.trim()) ? "Телефон или Telegram (@имя), чтобы написать, если что-то закончится." : "";

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setTried(true);
    if (items.length === 0 || !chosen || name.trim().length < 2 || !CONTACT.test(contact.trim())) return;
    setStatus("sending");
    window.setTimeout(() => setStatus("sent"), 900);
  };

  return (
    <section id="order" className="kt-order" aria-labelledby="kt-order-title">
      <div className="kt-wrap kt-order-grid">
        <div>
          <h2 id="kt-order-title" className="kt-h2">
            Отложить к&nbsp;своему часу
          </h2>
          <p className="kt-head-note">
            Ржаной к вечеру заканчивается. Отложите заранее: подпишем пакет и оставим на кассе, оплата на месте.
          </p>
        </div>

        <div className="kt-order-panel">
          {status === "sent" && chosen ? (
            <div className="kt-order-done" role="status">
              <p className="kt-eyebrow">Отложили</p>
              <p className="kt-order-done-title">
                {chosen.tomorrow ? "Завтра" : "Сегодня"} к {clock(chosen.at)}, на имя {name.trim()}
              </p>
              <ul>
                {items.map((b) => (
                  <li key={b.id}>
                    {b.name} × {basket[b.id]}
                  </li>
                ))}
              </ul>
              <p>Пакет будет на кассе. Если опоздаете, подержим до закрытия.</p>
              <p className="kt-order-note">Демо: заказ никуда не отправлен.</p>
              <button
                type="button"
                className="kt-link"
                onClick={() => {
                  basketStore.clear();
                  setStatus("idle");
                  setTried(false);
                }}
              >
                Отложить ещё
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <fieldset className="kt-pick">
                <legend>Что отложить</legend>
                {BREADS.map((b) => {
                  const n = basket[b.id] ?? 0;
                  const warm = chosen && n > 0 && warmAt(b.id, chosen.at);
                  return (
                    <div key={b.id} className="kt-pick-row" data-on={n > 0}>
                      <span className="kt-pick-name">
                        {b.name}
                        {warm && <small> будет тёплым</small>}
                      </span>
                      <span className="kt-pick-price kt-num">{rub(b.price)}</span>
                      <span className="kt-stepper">
                        <button type="button" onClick={() => basketStore.add(b.id, -1)} disabled={n === 0} aria-label={`Меньше: ${b.name}`}>
                          −
                        </button>
                        <span className="kt-num" aria-live="polite">
                          {n}
                        </span>
                        <button type="button" onClick={() => basketStore.add(b.id, 1)} aria-label={`Больше: ${b.name}`}>
                          +
                        </button>
                      </span>
                    </div>
                  );
                })}
                {emptyError && <p className="kt-error">{emptyError}</p>}
              </fieldset>

              <fieldset className="kt-times">
                <legend>
                  К какому времени
                  {slots[0]?.tomorrow ? ", на завтра" : ""}
                </legend>
                <div className="kt-times-row">
                  {slots.map((s) => (
                    <button
                      key={s.at}
                      type="button"
                      className="kt-time kt-num"
                      aria-pressed={at === s.at}
                      onClick={() => setAt(s.at)}
                    >
                      {clock(s.at)}
                    </button>
                  ))}
                </div>
                {timeError && <p className="kt-error">{timeError}</p>}
              </fieldset>

              <div className="kt-fields">
                <label className="kt-field">
                  <span>Имя на пакете</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" aria-invalid={Boolean(nameError)} />
                  {nameError && <em className="kt-error">{nameError}</em>}
                </label>
                <label className="kt-field">
                  <span>Телефон или Telegram</span>
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+7 или @имя"
                    aria-invalid={Boolean(contactError)}
                  />
                  {contactError && <em className="kt-error">{contactError}</em>}
                </label>
              </div>

              <div className="kt-order-foot">
                <p className="kt-order-total">
                  Итого <span className="kt-num">{rub(total)}</span>
                </p>
                <button type="submit" className="kt-btn" disabled={status === "sending"}>
                  {status === "sending" ? "Откладываем…" : chosen ? `Отложить к ${clock(chosen.at)}` : "Отложить"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
