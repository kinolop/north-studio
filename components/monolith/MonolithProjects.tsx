"use client";

import Image from "next/image";
import { useState } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { MONOLITH_PROJECT_IMAGES } from "@/lib/monolith";

import { MonolithReveal } from "./MonolithReveal";

/**
 * Four buildings, as an index rather than as a gallery.
 *
 * A practice's project list is a drawing register: number, year, name, type,
 * place, and a rule between each. So that is what this is — the picture is
 * the thing you get for asking, not the thing you scroll past.
 *
 * The preview resolves out of blur over a full second on the row under the
 * pointer and dissolves back when you leave the list. Everything the picture
 * shows is already in the row as text, which is what lets it be a pointer
 * affordance without hiding information from anyone who is not using one:
 * on devices that cannot hover, the same photographs are simply printed in
 * the rows and the sticky stage is not rendered at all. That swap is done in
 * CSS on `(hover: hover)`, not on a width breakpoint, because a wide
 * touchscreen is still a touchscreen.
 */
export function MonolithProjects() {
  const copy = useCopy().monolithCase;
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="mn-s-90 mn-section">
      <div className="mn-wrap">
        <MonolithReveal distance={0}>
          <p className="mn-mono mn-deboss-fine">{copy.projects.label}</p>
        </MonolithReveal>

        <div className="mn-projects mt-[clamp(2.5rem,7vh,4.5rem)]">
          <ol
            className="mn-index list-none p-0"
            onPointerLeave={() => setActive(null)}
          >
            {copy.projects.items.map((item, index) => {
              const src = MONOLITH_PROJECT_IMAGES[item.key];

              return (
                <li key={item.key}>
                  <div aria-hidden className="mn-groove" />

                  <MonolithReveal delay={index * 70}>
                    <div
                      className="mn-row"
                      onPointerEnter={() => setActive(index)}
                    >
                      <div className="flex items-baseline justify-between gap-6">
                        {/* The one burgundy on the page, after the seal.
                            A number stamped on a drawing, nothing more. */}
                        <span className="mn-mono mn-seal">
                          № {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="mn-mono mn-deboss-fine">{item.year}</span>
                      </div>

                      <h3 className="mn-project-name mn-deboss mt-[clamp(0.9rem,2vw,1.5rem)]">
                        {item.name}
                      </h3>

                      <p className="mn-mono mn-deboss-fine mt-[clamp(0.9rem,2vw,1.35rem)]">
                        {item.type}
                        <span aria-hidden> · </span>
                        {item.place}
                      </p>

                      {/* Printed in the row wherever there is no pointer to
                          hover with. Never rendered beside the stage — one
                          of the two is always display:none, so only one
                          version of each file is ever fetched. */}
                      {src && (
                        <div className="mn-inline-shot relative mt-[clamp(1.5rem,4vw,2.25rem)] aspect-[16/10] overflow-hidden">
                          <Image
                            src={src}
                            alt={item.alt}
                            fill
                            loading="lazy"
                            sizes="(min-width: 1024px) 42vw, 92vw"
                            className="object-cover object-center"
                          />
                        </div>
                      )}
                    </div>
                  </MonolithReveal>
                </li>
              );
            })}

            <div aria-hidden className="mn-groove" />
          </ol>

          <div className="mn-stage">
            <div className="mn-stage-inner">
              <div className="relative aspect-[16/10] overflow-hidden">
                {copy.projects.items.map((item, index) => {
                  const src = MONOLITH_PROJECT_IMAGES[item.key];
                  if (!src) return null;

                  return (
                    <div
                      key={item.key}
                      className="mn-shot"
                      data-active={active === index}
                    >
                      <Image
                        src={src}
                        alt={item.alt}
                        fill
                        loading="lazy"
                        sizes="(min-width: 1024px) 42vw, 92vw"
                        className="object-cover object-center"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
