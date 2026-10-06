"use client";

import { useEffect, useRef, useState } from "react";

import { GLAZES, STAGES, glazeById } from "@/lib/krug/data";
import { vesselName, volumeMl } from "@/lib/krug/profile";

import { cupStore, stageStore, useCup } from "./store";

/**
 * What happens to the cup after the evening, one screen per step, in the
 * order it happens; the numbers are that order.
 *
 * The cup itself is not in this section: it stands on the fixed layer
 * (`Stage`), walked over to the left. Whichever step is across the middle
 * of the window is the state the cup is in, and the page's ground follows
 * it: cobalt at the wheel and on the drying shelf, dark in the kiln, white
 * in the glazing room, cobalt again when it comes out finished.
 */
export function Process() {
  const steps = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const glazeId = useCup((c) => c.glaze);
  const profile = useCup((c) => c.profile);
  const glaze = glazeById(glazeId);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = steps.current.indexOf(entry.target as HTMLElement);
          if (i >= 0) {
            setActive(i);
            stageStore.set(i);
          }
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const s of steps.current) if (s) io.observe(s);
    // Back above the process, the cup is on the wheel again.
    const top = document.getElementById("top");
    const back = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && entry.intersectionRatio > 0.5) {
          setActive(0);
          stageStore.set(0);
        }
      },
      { threshold: [0, 0.5, 1] },
    );
    if (top) back.observe(top);
    return () => {
      io.disconnect();
      back.disconnect();
    };
  }, []);

  const name = vesselName(profile);
  const ml = Math.round(volumeMl(profile) / 10) * 10;

  return (
    <section id="process" className="kr-process" aria-label="Что будет с вашей чашкой">
      {STAGES.map((s, i) => (
        <article
          key={s.id}
          ref={(node) => {
            steps.current[i] = node;
          }}
          className="kr-step"
          data-active={active === i}
        >
          <div className="kr-wrap kr-step-in">
            <div className="kr-step-text">
              <p className="kr-step-no kr-num">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="kr-step-name">{s.name}</h2>
              <p className="kr-step-takes">
                {s.takes}
                {s.figure && <span className="kr-num">, {s.figure}</span>}
              </p>
              <p className="kr-step-body">{s.body}</p>

              {s.id === "glaze" && (
                <fieldset className="kr-glazes">
                  <legend>Выберите глазурь для своей чашки</legend>
                  {GLAZES.map((g) => (
                    <label key={g.id} className="kr-glaze" data-on={g.id === glazeId}>
                      <input
                        type="radio"
                        name="glaze"
                        value={g.id}
                        checked={g.id === glazeId}
                        onChange={() => cupStore.set({ glaze: g.id })}
                      />
                      <span
                        className="kr-glaze-chip"
                        style={{ background: `linear-gradient(180deg, ${g.thin} 0%, ${g.base} 40%, ${g.pool} 100%)` }}
                        aria-hidden
                      />
                      <span className="kr-glaze-name">{g.name}</span>
                      <span className="kr-glaze-note">{g.note}</span>
                    </label>
                  ))}
                </fieldset>
              )}

              {s.id === "fire" && (
                <p className="kr-step-result">
                  Готово: {name} на {ml}&nbsp;мл, глазурь «{glaze.name.toLowerCase()}». Забрать можно в мастерской или
                  получить СДЭКом.
                </p>
              )}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
