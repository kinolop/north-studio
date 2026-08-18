"use client";

import { useEffect, useRef, useState } from "react";

import { CHANNELS } from "@/lib/channels";
import { NOCTURA, NOCTURA_ASSETS } from "@/lib/noctura";

import { NocturaReveal } from "./NocturaReveal";

const CHANNEL_LABELS: Readonly<Record<string, string>> = {
  telegram: "Телеграм",
  whatsapp: "WhatsApp",
  email: "Почта",
};

/**
 * The booking desk.
 *
 * The form is decorative and says so, twice: once permanently under the
 * fields, and once again the moment it is submitted. It never claims to
 * have sent anything, and it never pretends a fictional hotel is taking
 * reservations. What it *does* do is put a real way to reach the studio
 * beside it, because the actual conversion on this page is somebody who
 * wants a site like this one.
 *
 * The suite ambience runs behind it - the heaviest file on the page, so it
 * is not fetched until the section is close, and it is scrimmed hard enough
 * that the form never has to compete with a moving picture.
 */
export function NocturaBooking() {
  const copy = NOCTURA.booking;
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="booking" className="n-section relative overflow-hidden">
      <AmbientSuite />

      <div className="n-wrap n-rel">
        <div className="grid gap-y-16 lg:grid-cols-12 lg:gap-x-16">
          {/* ---- The desk ---- */}
          <div className="lg:col-span-7">
            <NocturaReveal>
              <p className="n-label">{copy.eyebrow}</p>
            </NocturaReveal>

            <NocturaReveal delay={90} distance={30}>
              <h2 className="n-h2 mt-7">
                {copy.title.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            </NocturaReveal>

            <NocturaReveal delay={170}>
              <p className="n-lead mt-8 max-w-[46ch]">{copy.lede}</p>
            </NocturaReveal>

            <NocturaReveal delay={240} distance={26}>
              <form
                className="mt-14"
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  setSubmitted(true);
                }}
              >
                <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
                  <Field id="n-arrive" label={copy.fields.arrive}>
                    <input id="n-arrive" type="date" className="n-field" />
                  </Field>

                  <Field id="n-depart" label={copy.fields.depart}>
                    <input id="n-depart" type="date" className="n-field" />
                  </Field>

                  <Field id="n-guests" label={copy.fields.guests}>
                    <select id="n-guests" className="n-field" defaultValue="2 гостя">
                      {copy.guestOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field id="n-category" label={copy.fields.category}>
                    <select
                      id="n-category"
                      className="n-field"
                      defaultValue={NOCTURA.rooms.items[1]?.name}
                    >
                      {NOCTURA.rooms.items.map((room) => (
                        <option key={room.key} value={room.name}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <div className="sm:col-span-2">
                    <Field id="n-note" label={copy.fields.note}>
                      <textarea
                        id="n-note"
                        className="n-field"
                        rows={2}
                        placeholder={copy.fields.notePlaceholder}
                      />
                    </Field>
                  </div>
                </div>

                <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-4">
                  <button type="submit" className="n-btn n-btn-gold">
                    {copy.submit}
                  </button>

                  {/* Announced, because the only feedback this button gives
                      is a line of text appearing beside it. */}
                  <p
                    role="status"
                    aria-live="polite"
                    className="n-small"
                    style={{
                      color: "var(--n-gold)",
                      opacity: submitted ? 1 : 0,
                      transition: "opacity 420ms var(--n-ease)",
                    }}
                  >
                    {submitted ? copy.submitted : ""}
                  </p>
                </div>

                <p className="n-small mt-8 max-w-[62ch]">{copy.disclaimer}</p>
              </form>
            </NocturaReveal>
          </div>

          {/* ---- The studio, plainly ---- */}
          <NocturaReveal delay={200} className="lg:col-span-4 lg:col-start-9">
            <div
              className="h-full p-8 lg:p-9"
              style={{
                border: "1px solid var(--n-line-soft)",
                borderRadius: "var(--n-radius-plate)",
                background:
                  "linear-gradient(165deg, rgb(36 30 24 / 0.5), rgb(12 10 10 / 0.42))",
                backdropFilter: "blur(3px)",
              }}
            >
              <p className="n-label">{copy.contactLabel}</p>
              <p className="n-small mt-4">{copy.contactNote}</p>

              <ul className="mt-9 list-none space-y-6 p-0">
                {CHANNELS.map((channel) => (
                  <li
                    key={channel.id}
                    className="pt-5"
                    style={{ borderTop: "1px solid var(--n-line-soft)" }}
                  >
                    <p className="n-label n-label-dim">
                      {CHANNEL_LABELS[channel.id] ?? channel.id}
                    </p>
                    <a
                      href={channel.href}
                      className="n-link mt-3 inline-block"
                      style={{
                        fontFamily: "var(--font-cormorant), serif",
                        fontSize: "1.35rem",
                        lineHeight: 1.2,
                        color: "var(--n-ivory)",
                      }}
                      {...(channel.external
                        ? { target: "_blank", rel: "noreferrer noopener" }
                        : {})}
                    >
                      {channel.handle}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </NocturaReveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* A visible label, always. Placeholder-only fields lose their label
          the moment anybody types into them. */}
      <label htmlFor={id} className="n-label n-label-dim block">
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/**
 * The suite ambience, mounted late.
 *
 * `suite.mp4` is the largest file on the page by a wide margin, and it is
 * decoration - so nothing is fetched until the section is roughly a screen
 * away. Setting `src` on mount rather than in the markup is the whole
 * mechanism: a `<video src>` in the initial HTML starts downloading
 * immediately no matter what `preload` says.
 */
function AmbientSuite() {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setArmed(true);
        observer.disconnect();
      },
      { rootMargin: "90% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className="absolute inset-0 z-0 overflow-hidden">
      {/* The coded room, always painted, so this is never a black band. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 76% 30%, rgb(200 169 106 / 0.13), transparent 66%)," +
            "radial-gradient(60% 50% at 12% 84%, rgb(184 132 62 / 0.09), transparent 70%)," +
            "linear-gradient(180deg, #0b0908 0%, #14100c 52%, #0a0809 100%)",
        }}
      />

      {armed && !failed && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={`${NOCTURA_ASSETS}/suite.mp4`}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          onError={() => setFailed(true)}
          tabIndex={-1}
          style={{ opacity: 0.5 }}
        />
      )}

      {/* Hard scrim: the form has to be readable over whatever frame the
          video happens to be on. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgb(8 7 9 / 0.94) 0%, rgb(8 7 9 / 0.86) 46%, rgb(8 7 9 / 0.7) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgb(8 7 9 / 0.9), transparent 22%, transparent 78%, rgb(8 7 9 / 0.9))",
        }}
      />
    </div>
  );
}
