"use client";

import { useEffect, useRef } from "react";

import { useEngine } from "./engineStore";
import { moment } from "./moment";

/**
 * The customs stamp, struck on the map at the crossing while the border
 * chapter is on screen and the papers clear.
 *
 * It is the one decorative thing laid on the map, and it is there because
 * the border is the one moment in the journey where something is decided by
 * a person with a rubber stamp. The same stamp comes down on the waybill in
 * the chapter's panel at the same moment.
 */
export function Stamp() {
  const engine = useEngine();
  const stamp = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!engine) return;
    const place = () => {
      const s = stamp.current;
      const plan = engine.routePlan;
      if (!s || !plan) return;
      const on = moment.get().stamp > 0.5;
      s.dataset.on = on ? "true" : "false";
      const p = engine.project(plan.gate.x, 0, plan.gate.z);
      s.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
    };
    const a = engine.subscribe(place);
    const b = moment.subscribe(place);
    return () => {
      a();
      b();
    };
  }, [engine]);

  return (
    <div ref={stamp} className="mr-stamp" data-on="false" aria-hidden>
      <StampMark />
    </div>
  );
}

/** The mark itself, shared by the map and the waybill. */
export function StampMark({ id = "map" }: { id?: string }) {
  return (
    <svg viewBox="0 0 200 200" width="168" height="168" className="mr-stamp-svg">
      <defs>
        <path id={`mr-stamp-top-${id}`} d="M 34,100 A 66,66 0 0 1 166,100" />
        <path id={`mr-stamp-bottom-${id}`} d="M 28,100 A 72,72 0 0 0 172,100" />
        <filter id={`mr-stamp-ink-${id}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
        </filter>
      </defs>
      <g filter={`url(#mr-stamp-ink-${id})`} className="mr-stamp-ink">
        <circle cx="100" cy="100" r="92" />
        <circle cx="100" cy="100" r="84" />
        <circle cx="100" cy="100" r="50" />
        <text className="mr-stamp-ring">
          <textPath href={`#mr-stamp-top-${id}`} startOffset="50%" textAnchor="middle">
            ТАМОЖЕННЫЙ ПОСТ
          </textPath>
        </text>
        <text className="mr-stamp-ring">
          <textPath href={`#mr-stamp-bottom-${id}`} startOffset="50%" textAnchor="middle">
            ВЫПУСК РАЗРЕШЁН
          </textPath>
        </text>
        <text x="100" y="94" textAnchor="middle" className="mr-stamp-core">
          MR
        </text>
        <text x="100" y="118" textAnchor="middle" className="mr-stamp-mini">
          5510
        </text>
      </g>
    </svg>
  );
}
