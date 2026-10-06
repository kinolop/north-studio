"use client";

import { useEffect, useRef, useState } from "react";

import { GLAZES, STAGES, glazeById } from "@/lib/krug/data";
import { vesselName, volumeMl } from "@/lib/krug/profile";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { cupStore, useCup } from "./store";
import { VesselEngine } from "./VesselEngine";

/**
 * What happens to the cup after the evening, in the order it happens.
 *
 * The cup pulled in the hero stands on the left and does not move; the
 * steps scroll past on the right, and whichever step is in the middle of
 * the window is the state the cup is in. Wet and dark on the wheel, pale
 * and dusty on the shelf, pink-buff out of the first firing, chalky under
 * raw glaze, and glass at the end. The numbering is the real sequence.
 */
export function Process() {
  const reduced = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<VesselEngine | null>(null);
  const steps = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);

  const glazeId = useCup((c) => c.glaze);
  const profile = useCup((c) => c.profile);
  const glaze = glazeById(glazeId);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const { profile: p, glaze: g } = cupStore.get();
    const e = new VesselEngine(el, p, g, 0, { air: 2.6, anchorX: 0.5 });
    engine.current = e;
    // A handle for checking the stages by hand in development, where a hidden tab never runs a frame.
    if (process.env.NODE_ENV !== "production") (window as unknown as { __krugKiln?: VesselEngine }).__krugKiln = e;

    const ro = new ResizeObserver(() => e.resize());
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => (entry?.isIntersecting ? e.start() : e.stop()));
    io.observe(el);
    const unsub = cupStore.subscribe(() => {
      const c = cupStore.get();
      e.setProfile(c.profile);
      e.setGlaze(c.glaze);
      e.redraw();
    });
    return () => {
      unsub();
      io.disconnect();
      ro.disconnect();
      e.dispose();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    if (engine.current) engine.current.spin = reduced ? 0 : 0.32;
  }, [reduced]);

  // The step crossing the middle of the window is the one in force.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = steps.current.indexOf(entry.target as HTMLLIElement);
          if (i >= 0) setActive(i);
        }
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    for (const s of steps.current) if (s) io.observe(s);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    engine.current?.setStage(active);
  }, [active]);

  const name = vesselName(profile);
  const ml = Math.round(volumeMl(profile) / 10) * 10;

  return (
    <section id="process" className="kr-process" aria-labelledby="kr-process-title">
      <div className="kr-wrap">
        <header className="kr-head">
          <h2 id="kr-process-title" className="kr-h2">
            Что будет с&nbsp;вашей чашкой
          </h2>
          <p className="kr-head-note">
            Вечер за кругом занимает два часа. Ещё две-три недели чашку сушат, обтачивают и дважды обжигают. Дальше по порядку всё, что с ней происходит.
          </p>
        </header>

        <div className="kr-process-grid">
          <div className="kr-kiln">
            <canvas ref={canvas} className="kr-kiln-canvas" aria-hidden />
            <p className="kr-kiln-tag kr-num">
              <span>{String(active + 1).padStart(2, "0")}</span>
              <span>{STAGES[active]!.name}</span>
              {STAGES[active]!.figure && <span>{STAGES[active]!.figure}</span>}
            </p>
          </div>

          <ol className="kr-steps">
            {STAGES.map((s, i) => (
              <li
                key={s.id}
                ref={(node) => {
                  steps.current[i] = node;
                }}
                className="kr-step"
                data-active={active === i}
              >
                <p className="kr-step-no kr-num">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="kr-h3">{s.name}</h3>
                <p className="kr-step-takes">
                  {s.takes}
                  {s.figure && <span className="kr-num"> · {s.figure}</span>}
                </p>
                <p className="kr-step-body">{s.body}</p>

                {s.id === "glaze" && (
                  <fieldset className="kr-glazes">
                    <legend>Глазурь для вашей чашки</legend>
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
                          style={{ background: `linear-gradient(180deg, ${g.thin} 0%, ${g.base} 38%, ${g.pool} 100%)` }}
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
                    Готово: {name} на {ml} мл, глазурь «{glaze.name.toLowerCase()}». Забрать можно в мастерской, а
                    можно попросить отправить СДЭКом.
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
