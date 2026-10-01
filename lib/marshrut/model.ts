/**
 * The calculator.
 *
 * One pure function, `quote`, turns a handful of choices into everything the
 * page shows: how many cartons, how they stand on pallets, what each leg of
 * the journey costs and how long it takes, and how sure we are about that
 * time. The 3D scene, the sentence at the top of the page, the consignment
 * note and the tracking section all read the same object, so they cannot
 * disagree.
 *
 * The numbers are a demonstration. The structure is not: freight for light
 * goods really is priced by the space it takes rather than by its weight,
 * customs really is a fixed cost that does not shrink with the shipment, and
 * transit times really do come as a spread. Rates are set so a default
 * shipment lands where a forwarder's quote would.
 */

import {
  DESTINATIONS,
  MODES,
  PRODUCTS,
  byId,
  type DestId,
  type ModeId,
  type OriginId,
  type Product,
  type ProductId,
} from "./data";
import { packPallets, type PalletPlan } from "./pack";
import { buildRoute, type RoutePlan } from "./route";
import { clamp, mulberry32 } from "./util";

export interface Input {
  units: number;
  product: ProductId;
  origin: OriginId;
  dest: DestId;
  mode: ModeId;
  /** Purchase price per unit in yuan; the product's own price when absent. */
  priceCny?: number;
}

export const DEFAULT_INPUT: Input = {
  units: 3200,
  product: "tshirt",
  origin: "guangzhou",
  dest: "koledino",
  mode: "rail",
};

/** Roubles per yuan. A fixed demonstration rate, said so on the page. */
export const CNY_RUB = 11.4;
const VAT = 0.2;

interface Days {
  min: number;
  mode: number;
  max: number;
}

interface ModeModel {
  /** Roubles per kilogram at the reference density and distance. */
  rate: number;
  /** Cheapest a shipment of this kind is ever billed, roubles. */
  floor: number;
  /** Roubles per kilogram of consolidating and loading in China. */
  pickupPerKg: number;
  pickupFixed: number;
  /** Customs broker's fee, and the handling that grows with pallets. */
  brokerage: number;
  perPallet: number;
  /** Unloading and booking a slot at the marketplace warehouse. */
  dock: number;
  dockPerPallet: number;
  /** How much a kilometre costs on each side of the gate, relatively. */
  weight: { main: number; inland: number };
  days: { main: Days; customs: Days; inland: Days };
}

const MODEL: Record<ModeId, ModeModel> = {
  road: {
    rate: 118,
    floor: 24_000,
    pickupPerKg: 3.6,
    pickupFixed: 6_500,
    brokerage: 16_000,
    perPallet: 900,
    dock: 3_800,
    dockPerPallet: 320,
    weight: { main: 1, inland: 1.2 },
    days: {
      main: { min: 8, mode: 10, max: 14 },
      customs: { min: 1, mode: 2, max: 4 },
      inland: { min: 3, mode: 4, max: 7 },
    },
  },
  rail: {
    rate: 96,
    floor: 32_000,
    pickupPerKg: 3.6,
    pickupFixed: 6_500,
    brokerage: 21_000,
    perPallet: 1_100,
    dock: 3_800,
    dockPerPallet: 320,
    weight: { main: 1, inland: 1.25 },
    days: {
      main: { min: 9, mode: 11, max: 15 },
      customs: { min: 1, mode: 3, max: 5 },
      inland: { min: 4, mode: 6, max: 9 },
    },
  },
  sea: {
    rate: 62,
    floor: 40_000,
    pickupPerKg: 3.6,
    pickupFixed: 6_500,
    brokerage: 34_000,
    perPallet: 1_300,
    dock: 3_800,
    dockPerPallet: 320,
    weight: { main: 0.8, inland: 1 },
    days: {
      main: { min: 10, mode: 13, max: 19 },
      customs: { min: 2, mode: 4, max: 7 },
      inland: { min: 10, mode: 13, max: 18 },
    },
  },
  air: {
    rate: 545,
    floor: 38_000,
    pickupPerKg: 3.6,
    pickupFixed: 6_500,
    brokerage: 26_000,
    perPallet: 500,
    dock: 3_800,
    dockPerPallet: 320,
    weight: { main: 1, inland: 12 },
    days: {
      main: { min: 3, mode: 4, max: 7 },
      customs: { min: 1, mode: 3, max: 5 },
      inland: { min: 1, mode: 2, max: 3 },
    },
  },
};

/** Reference journeys, so the rates mean "Guangzhou to Koledino" whatever the choice. */
const REF: Record<ModeId, { main: number; inland: number; total: number }> = (() => {
  const out = {} as Record<ModeId, { main: number; inland: number; total: number }>;
  for (const mode of MODES) {
    const route = buildRoute("guangzhou", mode.id, "koledino");
    out[mode.id] = {
      main: route.legs[0].km,
      inland: route.legs[2].km,
      total: route.kmTotal,
    };
  }
  return out;
})();

export interface LegQuote {
  id: "main" | "customs" | "inland";
  name: string;
  detail: string;
  km: number;
  rub: number;
  perUnit: number;
  /** Share of the freight bill, 0..1. */
  share: number;
  days: Days;
}

export interface Quote {
  input: Input;
  product: Product;
  route: RoutePlan;
  cartons: number;
  kg: number;
  m3: number;
  density: number;
  chargeableKg: number;
  pallets: PalletPlan;
  /** Trailers, containers or flights, and what to call them. */
  vehicles: { count: number; label: string };
  legs: [LegQuote, LegQuote, LegQuote];
  freightRub: number;
  /** What moving one item costs, roubles: the number on the first screen. */
  perUnit: number;
  taxes: { declared: number; duty: number; vat: number; perUnit: number };
  /** Purchase price, freight and duty per item, VAT left out. */
  landedPerUnit: number;
  days: { min: number; p50: number; p80: number; p95: number; max: number; curve: { day: number; p: number }[] };
  priceCny: number;
}

/** Inverse CDF of a triangular distribution. */
function triangular(u: number, { min, mode, max }: Days): number {
  const c = (mode - min) / (max - min);
  return u < c
    ? min + Math.sqrt(u * (max - min) * (mode - min))
    : max - Math.sqrt((1 - u) * (max - min) * (max - mode));
}

function spread(legs: Days[]): { p50: number; p80: number; p95: number; curve: { day: number; p: number }[] } {
  const random = mulberry32(20260930);
  const samples: number[] = [];
  for (let i = 0; i < 4000; i++) {
    let total = 0;
    for (const leg of legs) total += triangular(random(), leg);
    samples.push(total);
  }
  samples.sort((a, b) => a - b);
  const pick = (q: number) => samples[Math.min(samples.length - 1, Math.floor(q * samples.length))] ?? 0;
  // Chance of having arrived by the end of each day: the shape of the risk.
  const first = Math.floor(samples[0] ?? 0);
  const last = Math.ceil(samples[samples.length - 1] ?? 0) + 1;
  const curve: { day: number; p: number }[] = [];
  let cursor = 0;
  for (let day = first - 1; day <= last; day++) {
    while (cursor < samples.length && (samples[cursor] ?? 0) <= day) cursor++;
    curve.push({ day, p: cursor / samples.length });
  }
  return { p50: pick(0.5), p80: pick(0.8), p95: pick(0.95), curve };
}

const scaleDays = (d: Days, k: number): Days => ({
  min: d.min * k,
  mode: d.mode * k,
  max: d.max * k,
});

export function quote(input: Input): Quote {
  const product = byId(PRODUCTS, input.product);
  const dest = byId(DESTINATIONS, input.dest);
  const model = MODEL[input.mode];
  const route = buildRoute(input.origin, input.mode, input.dest);
  const units = Math.max(1, Math.round(input.units));
  const priceCny = input.priceCny ?? product.priceCny;

  const cartons = Math.ceil(units / product.unitsPerCarton);
  const [cl, cw, ch] = product.carton;
  const cartonM3 = (cl * cw * ch) / 1_000_000;
  const kg = cartons * product.cartonKg;
  const m3 = cartons * cartonM3;
  const density = kg / m3;
  const pallets = packPallets(product.carton, cartons);

  // Light goods are billed for the room they take: the lower the density,
  // the more each kilogram costs. Air bills the larger of weight and volume.
  const chargeableKg = input.mode === "air" ? Math.max(kg, m3 * 167) : kg;
  const densityFactor =
    input.mode === "air" ? 1 : clamp(Math.pow(200 / density, 0.62), 0.72, 2.6);
  const reference = REF[input.mode];
  const distanceFactor = clamp(Math.pow(route.kmTotal / reference.total, 0.55), 0.55, 1.6);

  const declared = units * priceCny * CNY_RUB;
  const insurance = declared * 0.004;
  // Small lots ride consolidated cargo, so the fixed costs that would swamp
  // a few cartons are scaled down toward what a shared shipment really pays.
  const small = clamp(kg / 300, 0.2, 1);
  const brokerageScale = clamp(0.35 + (0.65 * kg) / 1500, 0.35, 1);
  const freight = Math.max(model.floor * small, chargeableKg * model.rate * densityFactor * distanceFactor);

  const [main, customs, inland] = route.legs;
  const mainShare = main.km * model.weight.main;
  const inlandShare = inland.km * model.weight.inland;
  const haulSplit = mainShare + inlandShare;

  const mainRub =
    (freight * mainShare) / haulSplit +
    model.pickupFixed * small +
    model.pickupPerKg * kg +
    insurance;
  const customsRub = model.brokerage * brokerageScale + model.perPallet * pallets.pallets;
  const inlandRub =
    (freight * inlandShare) / haulSplit + model.dock * small + model.dockPerPallet * pallets.pallets;
  const freightRub = mainRub + customsRub + inlandRub;

  const kmScale = (km: number, ref: number) => clamp(Math.pow(Math.max(km, 20) / ref, 0.7), 0.6, 1.5);
  const daysMain = scaleDays(model.days.main, kmScale(main.km, reference.main));
  const daysInland = scaleDays(model.days.inland, kmScale(inland.km, reference.inland));
  const daysCustoms = model.days.customs;
  const spreadDays = spread([daysMain, daysCustoms, daysInland]);

  const mk = (
    id: LegQuote["id"],
    name: string,
    detail: string,
    km: number,
    rub: number,
    days: Days,
  ): LegQuote => ({ id, name, detail, km, rub, perUnit: rub / units, share: rub / freightRub, days });

  const legs: [LegQuote, LegQuote, LegQuote] = [
    mk("main", mainName(input.mode), `${route.origin.name} до ${route.gate.name}`, main.km, mainRub, daysMain),
    mk("customs", "Таможня", `Оформление, ${route.gate.name}`, customs.km, customsRub, daysCustoms),
    mk("inland", inlandName(input.mode), `${route.gate.name} до склада в ${dest.prep}`, inland.km, inlandRub, daysInland),
  ];

  const duty = declared * product.duty;
  const vat = (declared + duty) * VAT;

  const trucks =
    input.mode === "road"
      ? Math.max(Math.ceil(pallets.pallets / 33), Math.ceil(kg / 20_000))
      : input.mode === "air"
        ? Math.max(1, Math.ceil(chargeableKg / 4_000))
        : Math.max(Math.ceil(pallets.pallets / 22), Math.ceil(kg / 24_000));

  return {
    input: { ...input, units },
    product,
    route,
    cartons,
    kg,
    m3,
    density,
    chargeableKg,
    pallets,
    vehicles: { count: trucks, label: vehicleLabel(input.mode, trucks) },
    legs,
    freightRub,
    perUnit: freightRub / units,
    taxes: { declared, duty, vat, perUnit: (duty + vat) / units },
    landedPerUnit: priceCny * CNY_RUB + freightRub / units + duty / units,
    days: {
      min: legs[0].days.min + legs[1].days.min + legs[2].days.min,
      p50: spreadDays.p50,
      p80: spreadDays.p80,
      p95: spreadDays.p95,
      curve: spreadDays.curve,
      max: legs[0].days.max + legs[1].days.max + legs[2].days.max,
    },
    priceCny,
  };
}

function mainName(mode: ModeId): string {
  return { road: "Китай до границы", rail: "Китай до границы", sea: "Морской участок", air: "Перелёт" }[mode];
}

function inlandName(mode: ModeId): string {
  return { road: "Транзит до склада", rail: "Транзит до склада", sea: "Транссиб до склада", air: "Из аэропорта на склад" }[mode];
}

function vehicleLabel(mode: ModeId, n: number): string {
  if (mode === "air") return n === 1 ? "1 борт" : `${n} рейса`;
  if (mode === "road") return n === 1 ? "1 фура" : `${n} фуры`;
  return n === 1 ? "1 контейнер 40 фут." : `${n} контейнера 40 фут.`;
}
