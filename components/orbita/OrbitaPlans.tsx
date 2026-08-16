"use client";

import { useCopy } from "@/components/i18n/CopyProvider";

import { OrbitaMesh } from "./OrbitaMesh";
import { OrbitaReveal } from "./OrbitaReveal";

export function OrbitaPlans() {
  const copy = useCopy();
  const plans = copy.orbitaCase.plans;

  return (
    <section id="plans" className="o-has-bg">
      <OrbitaMesh tone="calm" />

      <div className="o-wrap o-section o-rel">
        <OrbitaReveal className="max-w-[46rem]">
          <p className="o-label">{plans.eyebrow}</p>
          <h2 className="o-h2 mt-4 max-w-[20ch]">{plans.title}</h2>
          <p className="o-lead mt-5 max-w-[54ch]">{plans.note}</p>
        </OrbitaReveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.items.map((plan, index) => (
            <OrbitaReveal key={plan.key} delay={index * 90} className="h-full">
              <article
                className={`o-plan o-lift o-sweep flex h-full flex-col p-8 ${
                  plan.popular ? "o-plan-featured" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3
                    className="text-[1.15rem] font-semibold"
                    style={{ color: "var(--o-ink)" }}
                  >
                    {plan.name}
                  </h3>
                  {plan.popular && (
                    <span
                      className="rounded-full px-3 py-1 text-[0.72rem] font-semibold"
                      style={{
                        backgroundColor: "var(--o-accent)",
                        color: "var(--o-ink)",
                      }}
                    >
                      {plans.popularLabel}
                    </span>
                  )}
                </div>

                <p className="o-small mt-3 max-w-[34ch]">{plan.line}</p>

                <p className="mt-7 flex items-baseline gap-2">
                  <span
                    className="text-[2rem] font-semibold tracking-[-0.03em]"
                    style={{ color: "var(--o-ink)" }}
                  >
                    {plan.price}
                  </span>
                  <span className="o-small">{plan.cadence}</span>
                </p>

                <ul
                  className="mt-7 space-y-3 pt-7"
                  style={{ borderTop: "1px solid var(--o-line)" }}
                >
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <svg
                        aria-hidden
                        viewBox="0 0 20 20"
                        className="mt-[3px] h-[18px] w-[18px] shrink-0"
                      >
                        <path
                          d="M4.5 10.4l3.4 3.4L15.5 6.2"
                          fill="none"
                          stroke="var(--o-accent-deep)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="o-small" style={{ color: "var(--o-ink)" }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#start"
                  className={`o-btn mt-8 w-full ${plan.popular ? "o-btn-primary" : "o-btn-ghost"}`}
                >
                  {plan.cta}
                </a>
              </article>
            </OrbitaReveal>
          ))}
        </div>

        <OrbitaReveal delay={120}>
          <p className="o-small mt-8" style={{ color: "var(--o-muted)" }}>
            {plans.disclaimer}
          </p>
        </OrbitaReveal>
      </div>
    </section>
  );
}
