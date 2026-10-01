"use client";

import { useEffect, useRef, useState } from "react";

import { setScrollLocked } from "@/components/motion/SmoothScroll";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { boot, useBoot } from "./boot";

/**
 * The page opens the way a shipment does: the doors of a sea container.
 *
 * While the page loads, the doors are shut and sealed. The data plate on the
 * left door counts what has actually loaded (faces, the map, the shaders),
 * and the owner's code and the company's name are painted across the steel,
 * the name split by the seam. When everything is ready the seal is cut, the
 * handles swing out, the locking bars turn their cams free of the keepers,
 * and the doors open onto the cargo under the dock lamp. The stage starts
 * its own opening at that moment, so the camera leaves the pallet through
 * the open doors.
 *
 * Everything is CSS: corrugation is a repeating gradient, the bars are
 * shaded cylinders, the swing is a 3D rotation about each door's hinge.
 */

type Stage = "shut" | "unseal" | "unlock" | "open" | "through" | "gone";

const SEEN = "mr-doors-seen";

function Bar({ at }: { at: number }) {
  return (
    <div className="mr-bar" style={{ left: `${at}%` }}>
      <span className="mr-bar-rod" />
      <span className="mr-bar-cam" data-end="top" />
      <span className="mr-bar-cam" data-end="bottom" />
      <span className="mr-bar-keeper" data-end="top" />
      <span className="mr-bar-keeper" data-end="bottom" />
      <span className="mr-bar-guide" style={{ top: "24%" }} />
      <span className="mr-bar-guide" style={{ top: "76%" }} />
    </div>
  );
}

function Handle({ at, flip, sealed }: { at: number; flip?: boolean; sealed?: boolean }) {
  return (
    <div className="mr-handle" data-flip={flip ? "true" : "false"} style={{ left: `${at}%` }}>
      <span className="mr-handle-hub" />
      <span className="mr-handle-lever" />
      <span className="mr-handle-catch" />
      {sealed && (
        <span className="mr-seal" aria-hidden>
          <span className="mr-seal-bolt" />
          <span className="mr-seal-body">
            <i>MR</i>
            <b>5510 3382</b>
          </span>
        </span>
      )}
    </div>
  );
}

export function Loader() {
  const b = useBoot();
  const reduced = useReducedMotion();
  const [stage, setStage] = useState<Stage>("shut");
  const [shown, setShown] = useState(0);
  const t0 = useRef(0);
  const started = useRef(false);

  // The shown percentage runs toward the real one, never ahead of it.
  useEffect(() => {
    t0.current = performance.now();
    setScrollLocked(true);
    window.scrollTo(0, 0);
    let raf = 0;
    let value = 0;
    const loop = () => {
      const target = boot.get().progress;
      value += (target - value) * 0.08 + (target > value ? 0.002 : 0);
      value = Math.min(value, target);
      setShown(value);
      if (value < 0.999) raf = requestAnimationFrame(loop);
      else setShown(1);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      setScrollLocked(false);
    };
  }, []);

  useEffect(() => {
    if (!b.ready || shown < 0.999 || started.current) return;
    started.current = true;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN) === "1";
      sessionStorage.setItem(SEEN, "1");
    } catch {
      // Private mode: every visit is the first.
    }
    const minimum = seen ? 300 : 1100;
    const hold = Math.max(0, minimum - (performance.now() - t0.current));
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, hold + ms));

    if (reduced) {
      at(0, () => {
        boot.open();
        setStage("through");
      });
      at(500, () => {
        setStage("gone");
        setScrollLocked(false);
        boot.done();
      });
    } else {
      at(0, () => setStage("unseal"));
      at(420, () => setStage("unlock"));
      at(1050, () => setStage("open"));
      at(1250, () => boot.open());
      at(2300, () => setStage("through"));
      at(3000, () => {
        setStage("gone");
        setScrollLocked(false);
        boot.done();
      });
    }
    return () => timers.forEach(clearTimeout);
  }, [b.ready, shown, reduced]);

  if (stage === "gone") return null;
  const pct = Math.round(shown * 100);

  return (
    <div className="mr-loader" data-stage={stage} role="status" aria-live="polite">
      <span className="mr-sr">{b.ready ? "Страница загружена" : `Загрузка, ${pct}%`}</span>
      <div className="mr-container" aria-hidden>
        <div className="mr-opening">
          <div className="mr-door" data-side="left">
            <div className="mr-door-face">
              <div className="mr-door-ribs" />
              <p className="mr-door-word">
                <span>МАРШРУТ</span>
              </p>
              <div className="mr-plate">
                <div className="mr-plate-head">
                  <span>CSC</span>
                  <span>Safety approval</span>
                </div>
                <dl>
                  <div>
                    <dt>Груз</dt>
                    <dd>MR-0417</dd>
                  </div>
                  <div>
                    <dt>Маршрут</dt>
                    <dd>CN → RU</dd>
                  </div>
                </dl>
                <div className="mr-plate-load">
                  <span>{b.ready && pct >= 100 ? "Готов к выдаче" : "Загрузка"}</span>
                  <b className="mr-num">{String(pct).padStart(3, "0")}%</b>
                </div>
                <div className="mr-plate-bar">
                  <i style={{ transform: `scaleX(${shown})` }} />
                </div>
                <span className="mr-rivet" data-at="tl" />
                <span className="mr-rivet" data-at="tr" />
                <span className="mr-rivet" data-at="bl" />
                <span className="mr-rivet" data-at="br" />
              </div>
              <Bar at={15} />
              <Bar at={80} />
              <Handle at={15} />
              <Handle at={80} />
              <div className="mr-door-shade" />
            </div>
          </div>
          <div className="mr-door" data-side="right">
            <div className="mr-door-face">
              <div className="mr-door-ribs" />
              <p className="mr-door-word">
                <span>МАРШРУТ</span>
              </p>
              <div className="mr-code">
                <p>
                  MRSU <b>551038</b> <i>2</i>
                </p>
                <p className="mr-code-type">45G1</p>
                <p className="mr-code-mass">
                  MAX.GROSS 32 500 KG
                  <br />
                  TARE 3 800 KG
                </p>
              </div>
              <Bar at={20} />
              <Bar at={85} />
              <Handle at={20} flip sealed />
              <Handle at={85} flip />
              <div className="mr-door-shade" />
            </div>
          </div>
          <div className="mr-seam" />
        </div>
        <div className="mr-cf-rail" data-at="top" />
        <div className="mr-cf-rail" data-at="bottom" />
        <div className="mr-cf-post" data-at="left" />
        <div className="mr-cf-post" data-at="right" />
        <span className="mr-casting" data-at="tl" />
        <span className="mr-casting" data-at="tr" />
        <span className="mr-casting" data-at="bl" />
        <span className="mr-casting" data-at="br" />
        <div className="mr-lamp" />
      </div>
    </div>
  );
}
