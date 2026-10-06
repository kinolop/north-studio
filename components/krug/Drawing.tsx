import { useId } from "react";

import { outerWall, section, type Profile } from "@/lib/krug/profile";

/**
 * A pot drawn the way archaeologists and potters draw one: a vertical axis
 * down the middle, the outside on the left with its throwing lines, the cut
 * through the wall on the right, hatched. One drawing says the height, the
 * width, the wall and the foot at once, which a photograph cannot.
 *
 * Small pots are not blown up to fill the frame: the box never gets smaller
 * than `minBox` centimetres, so an espresso cup still looks small next to
 * a dish.
 */
export function VesselDrawing({
  profile,
  minBox = 12,
  className,
  title,
}: {
  profile: Profile;
  minBox?: number;
  className?: string;
  title?: string;
}) {
  const id = useId().replace(/:/g, "");
  const outer = outerWall(profile, 64);
  const sec = section(profile, 64);
  const top = profile.lip.y;
  const half = Math.max(...outer.map(([r]) => r));
  const pad = 1.2;
  const w = Math.max(half * 2 + pad * 2, minBox);
  const h = Math.max(top + pad * 2, minBox * 0.8);
  const Y = (y: number) => h - pad - y - (h - pad * 2 - top) / 2;
  const f = (n: number) => n.toFixed(2);

  const left = outer.map(([r, y]) => `${f(-r)},${f(Y(y))}`).join(" ");
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
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <pattern id={`h${id}`} width="0.32" height="0.32" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="0.32" className="kr-d-hatch" />
        </pattern>
      </defs>
      <line x1="0" x2="0" y1={f(Y(top) - 0.7)} y2={f(Y(0) + 0.7)} className="kr-d-axis" />
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
