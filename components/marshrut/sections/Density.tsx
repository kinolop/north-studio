"use client";

import { PRODUCTS, type ProductId } from "@/lib/marshrut/data";
import { num, plural, rub } from "@/lib/marshrut/format";

import { Chapter } from "../Chapter";
import { CountUp, Diary } from "../Diary";
import { useMoment } from "../moment";
import { CAPACITY } from "../engine/truck";
import { calc, useInput, useQuote } from "../store";

/**
 * Chapter one, day nought at the loading dock: why a kilogram of soft toys
 * costs more to move than a kilogram of mugs, told on the reader's own
 * cartons (their count, their weight, the room they take).
 *
 * The pallet under the lamp is the reader's own cargo, dimensioned. Beside
 * it, the argument in two parts. First, what a full trailer of it would be:
 * light goods fill the trailer's space long before its weight limit, so the
 * carrier is selling space, and the gauge shows how much of the weight the
 * reader would be paying for as air. Then the curve the calculator uses for
 * that, with the six products it knows as dots: choose one, and the cartons
 * on the pallet are repacked while you watch.
 */

const W = 560;
const H = 200;
const L = 46;
const R = 14;
const T = 18;
const B = 40;

const D0 = Math.log10(20);
const D1 = Math.log10(500);
const M0 = 0.5;
const M1 = 2.8;

/** Server and browser can disagree in the last digit of a logarithm; rounding keeps the markup identical. */
const r = (v: number) => Math.round(v * 100) / 100;
const xOf = (d: number) => r(L + ((Math.log10(d) - D0) / (D1 - D0)) * (W - L - R));
const yOf = (m: number) => r(T + (1 - (m - M0) / (M1 - M0)) * (H - T - B));
const factor = (d: number) => Math.min(2.6, Math.max(0.72, Math.pow(200 / d, 0.62)));

const curve = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const d = Math.pow(10, D0 + ((D1 - D0) * i) / 120);
    pts.push(`${i === 0 ? "M" : "L"}${xOf(d).toFixed(1)},${yOf(factor(d)).toFixed(1)}`);
  }
  return pts.join(" ");
})();

/** Labels placed by hand where dots would otherwise sit on top of each other. */
const LABEL: Record<ProductId, { dx: number; dy: number; anchor: "start" | "end" | "middle" }> = {
  plush: { dx: 10, dy: -11, anchor: "start" },
  hoodie: { dx: 0, dy: -13, anchor: "middle" },
  sneakers: { dx: 11, dy: -13, anchor: "start" },
  tshirt: { dx: 10, dy: 19, anchor: "start" },
  mug: { dx: -9, dy: -12, anchor: "end" },
  case: { dx: 8, dy: -11, anchor: "start" },
};

/** A trailer's legal payload, kilograms. */
const PAYLOAD = 20_000;

export function Density() {
  const q = useQuote();
  const input = useInput();

  const dots = PRODUCTS.map((p) => {
    const d = (p.carton[0] * p.carton[1] * p.carton[2]) / 1_000_000;
    const density = p.cartonKg / d;
    return { p, density, m: factor(density) };
  });
  const mine = q.density;
  const seen = useMoment((m) => m.chapter >= 1, false);
  const myFactor = q.input.mode === "air" ? 1 : factor(mine);

  // A trailer filled with this cargo: which runs out first, space or weight?
  const perPalletKg = q.pallets.perPallet * q.product.cartonKg;
  const fullKg = CAPACITY * perPalletKg;
  const byWeight = fullKg > PAYLOAD;
  const volumeShare = byWeight ? PAYLOAD / fullKg : 1;
  const weightShare = byWeight ? 1 : fullKg / PAYLOAD;
  const loadedKg = Math.min(PAYLOAD, fullKg);

  return (
    <Chapter id="density" index={1} km={0} place={`${q.route.origin.name}, склад приёмки`}>
      <Diary day={0} time="09:40">
        {q.route.origin.name}, склад приёмки.
      </Diary>
      <h2 className="mr-h2" id="density-title">
        {num(q.cartons)} {plural(q.cartons, ["короб", "короба", "коробов"])}: {num(Math.round(q.kg))} кг, но{" "}
        {num(q.m3, 1)} кубометра
      </h2>
      <p className="mr-lede">
        Фура заполнится по объёму раньше, чем по весу, а перевозчик продаёт место. Поэтому килограмм лёгкого
        груза стоит дороже килограмма тяжёлого.
      </p>

      <div className="mr-split" aria-label="Полная фура с вашим грузом">
        <p>
          <b className="mr-big mr-num">
            <CountUp value={Math.round(volumeShare * 100)} play={seen} suffix="%" />
          </b>
          <span>места в фуре занято</span>
        </p>
        <p>
          <b className="mr-big mr-num">
            <CountUp value={Math.round(weightShare * 100)} play={seen} suffix="%" />
          </b>
          <span>грузоподъёмности использовано</span>
        </p>
      </div>
      <p className="mr-note">
        {byWeight
          ? `${num(CAPACITY)} паллеты: ${q.product.name.toLowerCase()} упираются в ${num(PAYLOAD / 1000)} т раньше, чем в стены фуры. Здесь платят за вес.`
          : `${num(CAPACITY)} паллеты: ${q.product.name.toLowerCase()} весят ${num(loadedKg / 1000, 1)} т из ${num(PAYLOAD / 1000)} возможных. Остальное — воздух между коробами, и за него тоже платят.`}
      </p>

      <figure className="mr-chart">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Множитель к цене килограмма в зависимости от плотности груза">
          {[1, 1.5, 2, 2.5].map((m) => (
            <g key={m}>
              <line x1={L} x2={W - R} y1={yOf(m)} y2={yOf(m)} className="mr-grid" />
              <text x={L - 8} y={yOf(m) + 3.5} textAnchor="end" className="mr-axis">
                ×{String(m).replace(".", ",")}
              </text>
            </g>
          ))}
          {[25, 50, 100, 200, 400].map((d) => (
            <text key={d} x={xOf(d)} y={H - B + 18} textAnchor="middle" className="mr-axis">
              {d}
            </text>
          ))}
          <text x={W - R} y={H - 4} textAnchor="end" className="mr-axis-title">
            плотность, кг/м³
          </text>

          <path d={curve} className="mr-curve" pathLength={1} />

          <line x1={xOf(mine)} x2={xOf(mine)} y1={yOf(myFactor)} y2={H - B} className="mr-mine-line" />
          <circle cx={xOf(mine)} cy={yOf(myFactor)} r={7} className="mr-mine" />

          {dots.map(({ p, density, m }) => {
            const active = p.id === input.product;
            const lab = LABEL[p.id];
            return (
              <g
                key={p.id}
                className="mr-dot"
                data-active={active}
                tabIndex={0}
                role="button"
                aria-pressed={active}
                aria-label={`${p.name}: ${num(Math.round(density))} кг/м³`}
                onClick={() => calc.set({ product: p.id })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    calc.set({ product: p.id });
                  }
                }}
              >
                <circle cx={xOf(density)} cy={yOf(m)} r={14} className="mr-dot-hit" />
                <circle cx={xOf(density)} cy={yOf(m)} r={active ? 0 : 3.5} className="mr-dot-mark" />
                <text x={xOf(density) + lab.dx} y={yOf(m) + lab.dy} textAnchor={lab.anchor} className="mr-dot-label">
                  {p.name}
                </text>
              </g>
            );
          })}
        </svg>
        <figcaption>
          {q.product.name}: {num(Math.round(mine))} кг/м³,{" "}
          {q.input.mode === "air" ? "самолёт считает по объёму" : `×${num(myFactor, 2)} к цене килограмма`}, {rub(q.perUnit, q.perUnit < 100 ? 1 : 0)} за штуку.
          Выберите другой товар на кривой.
        </figcaption>
      </figure>
    </Chapter>
  );
}
