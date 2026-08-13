"use client";

import { useId, useState } from "react";

import { useCopy, useLocale } from "@/components/i18n/CopyProvider";
import { CHANNELS, FOUNDER_EMAIL, type ChannelId } from "@/lib/channels";

type Status = "idle" | "sending" | "sent" | "error";

interface Errors {
  name?: string;
  handle?: string;
  need?: string;
}

const MIN_NEED = 12;

export function BriefForm({
  prefill = "",
  compact = false,
}: {
  /** The configurator hands its summary through to here. */
  prefill?: string;
  compact?: boolean;
}) {
  const copy = useCopy();
  const { locale } = useLocale();
  const uid = useId();

  const [name, setName] = useState("");
  const [channel, setChannel] = useState<ChannelId>("telegram");
  const [handle, setHandle] = useState("");
  const [need, setNeed] = useState(prefill);
  /** Bots fill every field they find; humans never see this one. */
  const [company, setCompany] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});

  function validate(): boolean {
    const next: Errors = {};
    if (name.trim().length === 0) next.name = copy.form.required;
    if (handle.trim().length === 0) next.handle = copy.form.required;
    if (need.trim().length === 0) next.need = copy.form.required;
    else if (need.trim().length < MIN_NEED) next.need = copy.form.tooShort;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "sending") return;
    if (!validate()) return;

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, channel, handle, need, company, locale }),
      });
      setStatus(response.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  const fieldClass =
    "w-full rounded-[var(--radius-control)] border border-hairline bg-white/[0.025] px-4 py-3 text-body text-bone placeholder:text-slate transition-[border-color,background-color] duration-[var(--duration-state)] ease-[var(--ease-north)] focus:border-signal/60 focus:bg-white/[0.045] focus:outline-none";

  if (status === "sent") {
    return (
      <div
        role="status"
        className="glass glass-edge flex flex-col items-start gap-4 p-8"
      >
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-full border border-signal/40 text-signal-lift"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path
              d="M4 12.5 9.5 18 20 6.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="text-lead text-bone">{copy.form.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className={compact ? "" : "glass p-7 sm:p-9"}>
      {!compact && (
        <>
          <h3 className="font-display text-title font-medium text-bone">
            {copy.form.heading}
          </h3>
          <p className="mt-3 max-w-[46ch] text-body text-ash">{copy.form.lede}</p>
        </>
      )}

      <div className={`grid gap-5 ${compact ? "" : "mt-8"}`}>
        <Field
          id={`${uid}-name`}
          label={copy.form.name}
          error={errors.name}
          errorId={`${uid}-name-error`}
        >
          <input
            id={`${uid}-name`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={copy.form.namePlaceholder}
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${uid}-name-error` : undefined}
            className={fieldClass}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-[minmax(0,11rem)_1fr]">
          <Field id={`${uid}-channel`} label={copy.form.channel}>
            <select
              id={`${uid}-channel`}
              value={channel}
              onChange={(e) => setChannel(e.target.value as ChannelId)}
              className={`${fieldClass} appearance-none`}
            >
              {CHANNELS.map((option) => (
                <option key={option.id} value={option.id} className="bg-riser">
                  {copy.channels.labels[option.id]}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id={`${uid}-handle`}
            label={copy.form.handle}
            error={errors.handle}
            errorId={`${uid}-handle-error`}
          >
            <input
              id={`${uid}-handle`}
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder={copy.form.handlePlaceholder}
              inputMode={channel === "whatsapp" ? "tel" : "text"}
              aria-invalid={errors.handle ? true : undefined}
              aria-describedby={errors.handle ? `${uid}-handle-error` : undefined}
              className={fieldClass}
            />
          </Field>
        </div>

        <Field
          id={`${uid}-need`}
          label={copy.form.need}
          error={errors.need}
          errorId={`${uid}-need-error`}
        >
          <textarea
            id={`${uid}-need`}
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            placeholder={copy.form.needPlaceholder}
            rows={4}
            aria-invalid={errors.need ? true : undefined}
            aria-describedby={errors.need ? `${uid}-need-error` : undefined}
            className={`${fieldClass} resize-y`}
          />
        </Field>

        {/* Honeypot. Off-screen rather than display:none, which some bots skip. */}
        <div aria-hidden className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor={`${uid}-company`}>Company</label>
          <input
            id={`${uid}-company`}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={status === "sending"}
          className="group inline-flex items-center gap-3 rounded-[var(--radius-control)] border border-hairline bg-[linear-gradient(180deg,rgb(255_255_255/0.06),rgb(255_255_255/0.015))] px-7 py-3.5 text-meta text-bone transition-[border-color,opacity] duration-[var(--duration-state)] ease-[var(--ease-north)] hover:border-signal/50 disabled:cursor-wait disabled:opacity-50"
        >
          {status === "sending" ? copy.form.sending : copy.form.submit}
          <svg aria-hidden viewBox="0 0 24 10" className="h-[10px] w-6 text-signal-lift">
            <path
              d="M0 5h21M17 1l4 4-4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              className="transition-transform duration-[var(--duration-state)] ease-[var(--ease-north)] group-hover:translate-x-1"
            />
          </svg>
        </button>

        {status === "error" && (
          <p role="alert" className="text-meta text-ash">
            {copy.form.errorLead}{" "}
            <a
              href={`mailto:${FOUNDER_EMAIL}`}
              className="text-signal-lift underline underline-offset-4"
            >
              {FOUNDER_EMAIL}
            </a>
          </p>
        )}
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  errorId,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  errorId?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="label-mono mb-2.5 flex items-baseline gap-2">
        {label}
        {hint && <span className="text-hairline normal-case">({hint})</span>}
      </label>
      {children}
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-meta text-signal-lift">
          {error}
        </p>
      )}
    </div>
  );
}
