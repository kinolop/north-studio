"use client";

import { useCopy } from "@/components/i18n/CopyProvider";

import { OrbitaMesh } from "./OrbitaMesh";
import { OrbitaReveal } from "./OrbitaReveal";

export function OrbitaClose() {
  const copy = useCopy();
  const orbita = copy.orbitaCase;
  const close = orbita.close;
  const form = orbita.appForm;

  return (
    <section id="start" className="o-has-bg">
      <OrbitaMesh tone="rich" />

      <div className="o-wrap o-section o-rel">
        <OrbitaReveal>
          <div className="flex flex-col items-center text-center">
            <h2 className="o-h2 max-w-[18ch]">
              {close.title.map((line, index) => (
                <span key={line} className="block">
                  {index === close.title.length - 1 ? (
                    <span style={{ color: "var(--o-accent-text)" }}>{line}</span>
                  ) : (
                    line
                  )}
                </span>
              ))}
            </h2>

            <p className="o-lead mt-6 max-w-[44ch]">{close.body}</p>

            {/* Decorative. There is no backend behind this page and the
                field is not wired to one — the note below says so plainly
                rather than implying a signup that does not exist. */}
            <div className="mt-10 flex w-full max-w-[30rem] flex-col gap-3 sm:flex-row">
              <input
                type="email"
                inputMode="email"
                placeholder={form.placeholder}
                aria-label={form.placeholder}
                className="w-full rounded-full px-5 py-3.5 text-[0.95rem] outline-none"
                style={{
                  backgroundColor: "var(--o-white)",
                  border: "1px solid var(--o-line)",
                  color: "var(--o-ink)",
                }}
              />
              <a href="#top" className="o-btn o-btn-primary shrink-0">
                {form.action}
              </a>
            </div>

            <p className="o-small mt-4" style={{ color: "var(--o-muted)" }}>
              {form.note}
            </p>
          </div>
        </OrbitaReveal>
      </div>
    </section>
  );
}
