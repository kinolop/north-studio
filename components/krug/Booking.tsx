"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import { CLASSES, moscowNow, rub, schedule, type ClassId, type Slot } from "@/lib/krug/data";
import { cm, vesselName, widest } from "@/lib/krug/profile";

import { VesselDrawing } from "./Drawing";
import { useCup } from "./store";

const CONTACT = /^(@[\w]{4,}|\+?[\d\s()-]{10,})$/;

const dayLabel = (iso: string) => {
  const [y = 2026, m = 1, d = 1] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return {
    weekday: date.toLocaleDateString("ru-RU", { weekday: "short" }),
    day: String(d),
    month: date.toLocaleDateString("ru-RU", { month: "short" }).replace(".", ""),
    long: date.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" }),
    monday: date.getDay() === 1,
  };
};

type Status = "idle" | "sending" | "sent";

/**
 * The four ways to come, and the timetable to come by.
 *
 * Picking a format narrows the two weeks of dates to the days it runs;
 * picking a day shows its sittings with the seats drawn as they are, taken
 * and free. The form carries the reader's cup with it, as a drawing for the
 * potter, so the first evening can start from the shape they pulled on
 * this page. It is a demonstration and sends nothing, but it has every
 * state a real one would.
 */
export function Booking() {
  const profile = useCup((c) => c.profile);
  const touched = useCup((c) => c.touched);

  const [classId, setClassId] = useState<ClassId>("first");
  // The timetable is Moscow's today, which the server cannot know; it is
  // filled in on the client.
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    setSlots(schedule(moscowNow()));
  }, []);

  const days = useMemo(() => {
    if (!slots) return [];
    const all = Array.from(new Set(slots.map((s) => s.date)));
    // Mondays are missing from the timetable; put them back, closed.
    const out: string[] = [];
    const first = new Date(`${all[0]}T00:00:00`);
    for (let i = 0; i < 14; i += 1) {
      const d = new Date(first.getFullYear(), first.getMonth(), first.getDate() + i);
      out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
    }
    return out;
  }, [slots]);

  const forClass = useMemo(() => (slots ?? []).filter((s) => s.classId === classId), [slots, classId]);
  const openDays = useMemo(() => new Set(forClass.filter((s) => s.taken < s.seats).map((s) => s.date)), [forClass]);

  // Keep a valid day selected when the format changes.
  useEffect(() => {
    if (!slots) return;
    if (date && forClass.some((s) => s.date === date)) return;
    const firstOpen = forClass.find((s) => s.taken < s.seats);
    setDate(firstOpen?.date ?? null);
    setSlot(null);
  }, [slots, forClass, date]);

  const sittings = forClass.filter((s) => s.date === date);
  const format = CLASSES.find((c) => c.id === classId)!;

  const nameError = tried && name.trim().length < 2 ? "Напишите, как к вам обращаться." : "";
  const contactError =
    tried && !CONTACT.test(contact.trim()) ? "Нужен телефон или Telegram (@имя), чтобы прислать напоминание." : "";
  const slotError = tried && !slot ? "Выберите время занятия." : "";

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setTried(true);
    if (!slot || name.trim().length < 2 || !CONTACT.test(contact.trim())) return;
    setStatus("sending");
    window.setTimeout(() => setStatus("sent"), 900);
  };

  return (
    <section id="classes" className="kr-classes" aria-labelledby="kr-classes-title">
      <div className="kr-wrap">
        <header className="kr-head">
          <h2 id="kr-classes-title" className="kr-h2">
            Занятия
          </h2>
          <p className="kr-head-note">
            Все форматы с мастером, глина и фартук наши. Приходите в одежде, которую не жалко: глина отстирывается, но
            не с первого раза.
          </p>
        </header>

        <div className="kr-classes-grid">
          <div className="kr-formats" role="radiogroup" aria-label="Формат занятия">
            {CLASSES.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={classId === c.id}
                className="kr-format"
                onClick={() => {
                  setClassId(c.id);
                  setStatus("idle");
                }}
              >
                <span className="kr-format-top">
                  <span className="kr-format-name">{c.name}</span>
                  <span className="kr-format-price kr-num">
                    {rub(c.price)}
                    {c.priceNote && <small> {c.priceNote}</small>}
                  </span>
                </span>
                <span className="kr-format-meta">
                  {c.length} · {c.group}
                </span>
                <span className="kr-format-body">{c.body}</span>
              </button>
            ))}
          </div>

          <div id="book" className="kr-book">
            {status === "sent" && slot ? (
              <div className="kr-book-done" role="status">
                <p className="kr-eyebrow">Записали</p>
                <p className="kr-book-done-title">
                  {format.name}, {dayLabel(slot.date).long}, в {slot.time}
                </p>
                <p>
                  {name.trim()}, место за вами. За день до занятия пришлём напоминание и как найти дверь во дворе.
                </p>
                <p className="kr-book-note">Демо: заявка никуда не отправлена.</p>
                <button type="button" className="kr-link" onClick={() => setStatus("idle")}>
                  Записаться ещё раз
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <p className="kr-book-title">
                  Запись: <span>{format.name.toLowerCase()}</span>
                </p>

                <fieldset className="kr-days">
                  <legend>День</legend>
                  {slots === null ? (
                    <p className="kr-book-wait">Загружаем расписание…</p>
                  ) : (
                    <div className="kr-days-row">
                      {days.map((d) => {
                        const l = dayLabel(d);
                        const has = openDays.has(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            className="kr-day"
                            aria-pressed={date === d}
                            disabled={!has}
                            onClick={() => {
                              setDate(d);
                              setSlot(null);
                            }}
                            title={l.monday ? "По понедельникам загружаем печь" : undefined}
                          >
                            <span className="kr-day-wd">{l.weekday}</span>
                            <span className="kr-day-d kr-num">{l.day}</span>
                            <span className="kr-day-m">{l.monday ? "печь" : l.month}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </fieldset>

                <fieldset className="kr-sittings">
                  <legend>Время</legend>
                  {sittings.length === 0 && slots !== null && (
                    <p className="kr-book-wait">В ближайшие две недели мест нет. Напишите нам, поставим в лист ожидания.</p>
                  )}
                  {sittings.map((s) => {
                    const free = s.seats - s.taken;
                    const full = free <= 0;
                    return (
                      <button
                        key={s.time}
                        type="button"
                        className="kr-sitting"
                        aria-pressed={slot === s}
                        disabled={full}
                        onClick={() => setSlot(s)}
                      >
                        <span className="kr-sitting-time kr-num">{s.time}</span>
                        <span className="kr-seats" aria-hidden>
                          {Array.from({ length: s.seats }, (_, i) => (
                            <i key={i} data-taken={i < s.taken} />
                          ))}
                        </span>
                        <span className="kr-sitting-free">
                          {full
                            ? "мест нет"
                            : s.seats === 1
                              ? "свободно"
                              : `${free} ${free === 1 ? "место" : free < 5 ? "места" : "мест"}`}
                        </span>
                      </button>
                    );
                  })}
                  {slotError && <p className="kr-error">{slotError}</p>}
                </fieldset>

                <div className="kr-fields">
                  <label className="kr-field">
                    <span>Как вас зовут</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="given-name"
                      aria-invalid={Boolean(nameError)}
                    />
                    {nameError && <em className="kr-error">{nameError}</em>}
                  </label>
                  <label className="kr-field">
                    <span>Телефон или Telegram</span>
                    <input
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+7 или @имя"
                      aria-invalid={Boolean(contactError)}
                    />
                    {contactError && <em className="kr-error">{contactError}</em>}
                  </label>
                </div>

                <div className="kr-sketch">
                  <VesselDrawing profile={profile} minBox={13} className="kr-sketch-draw" />
                  <p>
                    {touched ? (
                      <>
                        Ваш эскиз: {vesselName(profile)}, Ø {cm(widest(profile))} и высота {cm(profile.lip.y)} см.
                        Приложим его к записи, и мастер начнёт с этой формы.
                      </>
                    ) : (
                      <>
                        Вытяните чашку на первом экране, и её эскиз попадёт в запись. Мастер начнёт занятие с этой
                        формы.
                      </>
                    )}
                  </p>
                </div>

                <button type="submit" className="kr-btn kr-book-submit" disabled={status === "sending"}>
                  {status === "sending"
                    ? "Записываем…"
                    : slot
                      ? `Записаться на ${dayLabel(slot.date).day} ${dayLabel(slot.date).month}, ${slot.time}`
                      : "Записаться"}
                </button>
                <p className="kr-book-note">
                  {rub(format.price)}
                  {format.priceNote ? ` ${format.priceNote}` : ""}, оплата в мастерской. Отменить можно за сутки.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
