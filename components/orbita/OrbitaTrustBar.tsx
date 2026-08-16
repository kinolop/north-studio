"use client";

import type { ReactNode } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";

import { OrbitaReveal } from "./OrbitaReveal";

/** Three plain line icons, drawn for a light surface. */
const ICON: Record<string, ReactNode> = {
  security: (
    <path d="M12 3.2l6.4 2.6v5.1c0 4-2.7 7.3-6.4 8.6-3.7-1.3-6.4-4.6-6.4-8.6V5.8L12 3.2z" />
  ),
  instant: <path d="M13.2 3.4L5.6 13.1h5l-.8 7.5 7.6-9.7h-5l.8-7.5z" />,
  fees: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M9.2 9.4h5.6M9.2 12h5.6M11 7.6v8.8" />
    </>
  ),
};

export function OrbitaTrustBar() {
  const copy = useCopy();
  const trust = copy.orbitaCase.trust;

  return (
    <section className="o-band-soft">
      <div className="o-wrap py-12">
        <ul className="grid gap-8 sm:grid-cols-3">
          {trust.map((item, index) => (
            <OrbitaReveal key={item.key} delay={index * 70}>
              <li className="flex items-start gap-3.5">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="mt-0.5 h-[22px] w-[22px] shrink-0"
                  fill="none"
                  stroke="var(--o-accent-deep)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {ICON[item.key]}
                </svg>
                <span>
                  <span
                    className="block font-semibold"
                    style={{ color: "var(--o-ink)" }}
                  >
                    {item.label}
                  </span>
                  <span className="o-small mt-1 block">{item.note}</span>
                </span>
              </li>
            </OrbitaReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
