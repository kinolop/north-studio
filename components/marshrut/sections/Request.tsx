"use client";

import { useState, type FormEvent } from "react";

import { MODES, ORIGINS, PRODUCTS, byId, DESTINATIONS } from "@/lib/marshrut/data";
import { days, num, plural, priceDigits, rub } from "@/lib/marshrut/format";

import { Chapter } from "../Chapter";
import { Diary } from "../Diary";
import { useQuote } from "../store";

/**
 * Chapter six, at the warehouse: the cargo has arrived, and the last thing
 * on the page turns the calculation into a request.
 *
 * Behind the panel the whole route is back in view, travelled end to end.
 * The form carries the reader's shipment with it, so what is sent is not
 * "please contact me" but a quote to be confirmed, and what comes back can
 * be a number. It is a demonstration and sends nothing; it still has every
 * state a real one would (untouched, wrong, sending, sent), because a form
 * that only works when filled in perfectly is not a form.
 */

type Status = "idle" | "sending" | "sent";

const CONTACT = /^(@[\w]{4,}|\+?[\d\s()-]{10,}|[^\s@]+@[^\s@]+\.[^\s@]+)$/;

export function Request() {
  const q = useQuote();
  const product = byId(PRODUCTS, q.input.product);
  const origin = byId(ORIGINS, q.input.origin);
  const dest = byId(DESTINATIONS, q.input.dest);
  const mode = byId(MODES, q.input.mode);

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [touched, setTouched] = useState<{ name?: boolean; contact?: boolean }>({});
  const [status, setStatus] = useState<Status>("idle");

  const nameError = touched.name && name.trim().length < 2 ? "Как к вам обращаться?" : "";
  const contactError =
    touched.contact && !CONTACT.test(contact.trim())
      ? "Укажите Telegram (@имя), телефон или почту, чтобы мы знали, куда ответить."
      : "";

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setTouched({ name: true, contact: true });
    if (name.trim().length < 2 || !CONTACT.test(contact.trim())) return;
    setStatus("sending");
    window.setTimeout(() => setStatus("sent"), 1100);
  };

  return (
    <Chapter
      id="request"
      index={6}
      km={q.route.kmTotal}
      place={`${dest.name}, склад маркетплейса`}
      className="mr-request"
    >
      <Diary day={Math.round(q.days.p50)} time="14:20">
        {dest.name}, ворота 14. {num(Math.round(q.route.kmTotal))} км от {origin.from}.
      </Diary>
      <h2 className="mr-h2" id="request-title">
        Принято {num(q.cartons)} {plural(q.cartons, ["короб", "короба", "коробов"])} из {num(q.cartons)}
      </h2>
      <p className="mr-request-sum">
        <span className="mr-num">{num(q.input.units)}</span> {plural(q.input.units, product.forms)} из {origin.from} на
        склад в {dest.prep}, {mode.by}: <b className="mr-num">{rub(q.perUnit, priceDigits(q.perUnit))}</b> за штуку,{" "}
        {days(q.days.p50)}. Пришлём такой же расчёт на вашу партию за рабочий день: цифрой, а не вопросом «что везём».
      </p>

      {status === "sent" ? (
        <div className="mr-sent" role="status">
          <p className="mr-sent-title">Расчёт ушёл</p>
          <p>
            {name.trim()}, мы ответим на {contact.trim()} в течение рабочего дня. Это демонстрация: форма ничего не
            отправляет, но настоящая делает то же самое.
          </p>
          <button
            type="button"
            className="mr-btn"
            data-ghost="true"
            onClick={() => {
              setStatus("idle");
              setTouched({});
            }}
          >
            Отправить ещё один
          </button>
        </div>
      ) : (
        <form className="mr-form" onSubmit={onSubmit} noValidate>
          <div className="mr-field-block">
            <label htmlFor="req-name">Как к вам обращаться</label>
            <input
              id="req-name"
              className="mr-input"
              value={name}
              autoComplete="name"
              aria-invalid={!!nameError}
              aria-describedby="req-name-err"
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            />
            <p id="req-name-err" className="mr-error" role={nameError ? "alert" : undefined}>
              {nameError}
            </p>
          </div>
          <div className="mr-field-block">
            <label htmlFor="req-contact">Telegram, телефон или почта</label>
            <input
              id="req-contact"
              className="mr-input"
              value={contact}
              autoComplete="off"
              aria-invalid={!!contactError}
              aria-describedby="req-contact-err"
              onChange={(e) => setContact(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, contact: true }))}
            />
            <p id="req-contact-err" className="mr-error" role={contactError ? "alert" : undefined}>
              {contactError}
            </p>
          </div>
          <button type="submit" className="mr-btn mr-btn-big" disabled={status === "sending"}>
            {status === "sending" ? "Отправляем" : "Отправить расчёт"}
          </button>
        </form>
      )}
    </Chapter>
  );
}
