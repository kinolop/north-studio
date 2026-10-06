import { useId } from "react";

import type { Glaze } from "@/lib/krug/data";
import { outerWall, section, type Profile } from "@/lib/krug/profile";

/**
 * A pot drawn the way archaeologists and potters draw one: a vertical axis
 * down the middle, the outside on the left, the cut through the wall on the
 * right, hatched. One drawing says the height, the width, the wall and the
 * foot at once, which a photograph cannot.
 *
 * Given a glaze, the outside half is coloured with it, pooling darker
 * towards the foot and breaking pale at the rim, as on a coloured plate in
 * a catalogue of finds.
 *
 * `exact` crops the drawing to the pot with its base on the bottom edge, so
 * pots drawn at one scale can stand on one shelf line; otherwise the box
 * never gets smaller than `minBox` centimetres, so a small cup still looks
 * small.
 */
export function VesselDrawing({
  profile,
  glaze,
  exact = false,
  minBox = 12,
  className,
  title,
}: {
  profile: Profile;
  glaze?: Glaze;
  exact?: boolean;
  minBox?: number;
  className?: string;
  title?: string;
}) {
  const id = useId().replace(/:/g, "");
  const outer = outerWall(profile, 64);
  const sec = section(profile, 64);
  const top = profile.lip.y;
  const half = Math.max(...outer.map(([r]) => r));

  const padX = exact ? 0.3 : 1.2;
  const padTop = exact ? 0.3 : 1.2;
  const padBottom = exact ? 0.06 : 1.2;
  const w = exact ? half * 2 + padX * 2 : Math.max(half * 2 + padX * 2, minBox);
  const h = exact ? top + padTop + padBottom : Math.max(top + padTop + padBottom, minBox * 0.8);
  const Y = (y: number) => (exact ? h - padBottom - y : h - padBottom - y - (h - padTop - padBottom - top) / 2);
  const f = (n: number) => n.toFixed(2);

  const left = outer.map(([r, y]) => `${f(-r)},${f(Y(y))}`).join(" ");
  const skin = [`0,${f(Y(top))}`, `${f(-profile.lip.r)},${f(Y(top))}`, ...outer.slice().reverse().map(([r, y]) => `${f(-r)},${f(Y(y))}`), `0,${f(Y(0))}`].join(" ");
  const cut = sec.map(([r, y]) => `${f(r)},${f(Y(y))}`).join(" ");

  // Throwing lines on the outside: one at each crest of a pull.
  const rings: [number, number][] = [];
  for (let y = 1.2; y < top - 0.7; y += 1.05) {
    const near = outer.reduce((best, pt) => (Math.abs(pt[1] - y) < Math.abs(best[1] - y) ? pt : best));
    rings.push([near[0], y]);
  }

  return (
    <svg
      viewBox={`${f(-w / 2)} 0 ${f(w)} ${f(h)}`}
      className={className}
      style={exact ? ({ "--w": w, "--h": h } as React.CSSProperties) : undefined}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <pattern id={`h${id}`} width="0.32" height="0.32" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="0.32" className="kr-d-hatch" />
        </pattern>
        {glaze && (
          <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={glaze.thin} />
            <stop offset="18%" stopColor={glaze.base} />
            <stop offset="88%" stopColor={glaze.pool} />
            <stop offset="94%" stopColor="#b9a58e" />
          </linearGradient>
        )}
      </defs>
      {glaze && <polygon points={skin} fill={`url(#g${id})`} className="kr-d-skin" />}
      <line x1="0" x2="0" y1={f(Y(top) - (exact ? 0.2 : 0.7))} y2={f(Y(0) + (exact ? 0 : 0.7))} className="kr-d-axis" />
      <polyline points={left} className="kr-d-line" />
      <line x1={f(-profile.lip.r)} x2={f(profile.lip.r)} y1={f(Y(top))} y2={f(Y(top))} className="kr-d-line" />
      <line x1={f(-profile.foot)} x2="0" y1={f(Y(0))} y2={f(Y(0))} className="kr-d-line" />
      {rings.map(([r, y]) => (
        <line key={y} x1={f(-r + 0.08)} x2="-0.2" y1={f(Y(y))} y2={f(Y(y))} className="kr-d-ring" />
      ))}
      <polygon points={cut} fill={`url(#h${id})`} className="kr-d-cut" />
    </svg>
  );
}
