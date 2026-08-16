"use client";

import { useCopy } from "@/components/i18n/CopyProvider";

import { OrbitaReveal } from "./OrbitaReveal";

export function OrbitaClose() {
  const copy = useCopy();
  const close = copy.orbitaCase.close;

  return (
    <section id="start" className="o-band-white">
      <div className="o-wrap o-section">
        <OrbitaReveal>
          <div
            className="flex flex-col items-center rounded-[28px] px-8 py-20 text-center sm:px-14"
            style={{ backgroundColor: "var(--o-tint)" }}
          >
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

            <p className="o-lead mt-6 max-w-[42ch]">{close.body}</p>

            <a href="#top" className="o-btn o-btn-primary mt-10 !px-8 !py-4">
              {close.action}
            </a>
          </div>
        </OrbitaReveal>
      </div>
    </section>
  );
}
