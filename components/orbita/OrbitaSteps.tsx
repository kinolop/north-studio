"use client";

import { useCopy } from "@/components/i18n/CopyProvider";

import { OrbitaReveal } from "./OrbitaReveal";

export function OrbitaSteps() {
  const copy = useCopy();
  const steps = copy.orbitaCase.steps;

  return (
    <section className="o-band-soft">
      <div className="o-wrap o-section">
        <OrbitaReveal>
          <p className="o-label">{steps.eyebrow}</p>
          <h2 className="o-h2 mt-4 max-w-[16ch]">{steps.title}</h2>
        </OrbitaReveal>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.items.map((step, index) => (
            <OrbitaReveal key={step.key} delay={index * 80} className="h-full">
              <li className="o-card flex h-full flex-col p-8">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full text-[1.05rem] font-semibold"
                  style={{
                    backgroundColor: "var(--o-tint)",
                    color: "var(--o-accent-text)",
                  }}
                >
                  {index + 1}
                </span>
                <h3 className="o-h3 mt-6">{step.title}</h3>
                <p className="mt-3">{step.body}</p>
              </li>
            </OrbitaReveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
