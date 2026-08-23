"use client";

import { useCopy } from "@/components/i18n/CopyProvider";

import { MonolithReveal } from "./MonolithReveal";

/**
 * Three principles, at length, on the darkest pour before the contact slab.
 *
 * The grid alternates 7/5 and 5/7 so the reading column changes sides down
 * the section — the same device a practice uses on a spread, and the reason
 * neither half ever fills: the empty five columns are the point.
 *
 * The numerals are pressed into that emptiness at a size no screen can hold,
 * so each one runs off its edge. They are texture, not text: the readable
 * number is the mono caption over the principle, and these are `aria-hidden`
 * and set in the ghost face, a hair off the ground, exactly like a mark
 * struck into a wall that you notice second.
 */
export function MonolithApproach() {
  const copy = useCopy().monolithCase;

  return (
    <section className="mn-s-75 mn-section">
      <div className="mn-wrap">
        <MonolithReveal distance={0}>
          <p className="mn-mono mn-deboss-fine">{copy.approach.label}</p>
        </MonolithReveal>

        <div className="mt-[clamp(2rem,6vh,3.5rem)]">
          {copy.approach.items.map((item, index) => (
            <article
              key={item.key}
              className="mn-principle"
              data-flip={index % 2 === 1}
            >
              <div aria-hidden className="mn-groove mn-principle-rule" />

              <div aria-hidden className="mn-principle-numeral">
                <span className="mn-numeral mn-deboss-ghost">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="mn-principle-body">
                <MonolithReveal>
                  <p className="mn-mono mn-deboss-fine">{item.note}</p>

                  <h3 className="mn-title mn-deboss mt-[clamp(1.25rem,3vw,2rem)] max-w-[20ch]">
                    {item.name}
                  </h3>
                </MonolithReveal>

                <MonolithReveal delay={100}>
                  <div className="mt-[clamp(1.5rem,3.5vw,2.5rem)] max-w-[54ch] space-y-[1.15em]">
                    {item.body.map((paragraph) => (
                      <p key={paragraph} className="mn-body">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </MonolithReveal>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
