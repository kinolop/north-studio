"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Maximum lean, in degrees. Past about four this stops reading as depth. */
const TILT = 3;

/**
 * The cursor, lighting one panel.
 *
 * Pairs with the `lit-panel` utility in globals.css: this writes four custom
 * properties, the CSS does everything visible. Deliberately no springs and
 * no animation frame — the handler only runs while a pointer is actually
 * over the element, and a CSS transition does the smoothing for free. A
 * dozen cards on a page therefore cost nothing until one is touched.
 *
 * Degrades the same way the rest of the site does: a coarse pointer has no
 * hover to respond to and reduced motion has asked for none, so both keep
 * the panel flat and let the global cursor light — which sweeps on its own
 * on touch — carry the room.
 */
export function useLitPanel<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    // Watched rather than sampled once. A tablet with a keyboard folio
    // attached, a laptop whose touchscreen is in use, a visitor turning
    // reduced motion on mid-visit — all of them change the answer, and a
    // panel that went dead at mount never comes back.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => setLive(fine.matches && !calm.matches);
    sync();

    fine.addEventListener("change", sync);
    calm.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      calm.removeEventListener("change", sync);
    };
  }, []);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<T>) => {
      const element = ref.current;
      if (!element || !live) return;

      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      element.style.setProperty("--px", `${x.toFixed(0)}px`);
      element.style.setProperty("--py", `${y.toFixed(0)}px`);
      element.style.setProperty(
        "--ty",
        `${((x / rect.width - 0.5) * 2 * TILT).toFixed(2)}deg`,
      );
      element.style.setProperty(
        "--tx",
        `${(-(y / rect.height - 0.5) * 2 * TILT).toFixed(2)}deg`,
      );
    },
    [live],
  );

  const onPointerLeave = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    // The pool fades on :hover; only the lean has to be returned by hand.
    element.style.setProperty("--tx", "0deg");
    element.style.setProperty("--ty", "0deg");
  }, []);

  return { ref, props: { onPointerMove, onPointerLeave } };
}
