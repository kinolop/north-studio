/**
 * How cartons stand on a pallet.
 *
 * The 3D pallet on the first screen is not decoration, it is this
 * calculation drawn: the same orientation, the same rows, the same number of
 * layers that decide how many pallets a shipment needs, and through them
 * what the shipment costs. Change the product and the cartons rearrange
 * because the arithmetic changed.
 *
 * Deliberately a simple column stack: every layer identical, no pinwheels.
 * It is what a warehouse does when it has to be right at speed, and a bad
 * packer would only ever make the estimate too kind.
 */

/** A standard EUR pallet, metres. */
export const PALLET = { w: 1.2, d: 0.8, h: 0.144 } as const;
/** Highest a loaded pallet is allowed to stand, pallet included. */
export const MAX_STACK = 1.8;

export interface Slot {
  x: number;
  y: number;
  z: number;
}

export interface PalletPlan {
  /** Carton as placed, metres: l along the pallet, w across it, h upright. */
  l: number;
  w: number;
  h: number;
  nx: number;
  nz: number;
  layers: number;
  perLayer: number;
  perPallet: number;
  pallets: number;
  /** Cartons on the last pallet, which is rarely full. */
  lastPallet: number;
  /** Height of one full pallet including the pallet itself. */
  height: number;
  /** Centres of the cartons on the pallet that is drawn, above the pallet's top. */
  slots: Slot[];
}

function orientations(dims: readonly [number, number, number]): [number, number, number][] {
  const [a, b, c] = dims;
  const all: [number, number, number][] = [
    [a, b, c],
    [b, a, c],
    [a, c, b],
    [c, a, b],
    [b, c, a],
    [c, b, a],
  ];
  const seen = new Set<string>();
  return all.filter((o) => {
    const key = o.join("x");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function packPallets(cartonCm: readonly [number, number, number], cartons: number): PalletPlan {
  const dims = cartonCm.map((v) => v / 100) as unknown as [number, number, number];
  let best: PalletPlan | null = null;
  let bestScore = -1;

  for (const [l, w, h] of orientations(dims)) {
    const layers = Math.max(1, Math.floor((MAX_STACK - PALLET.h) / h));
    const straight = [Math.floor(PALLET.w / l), Math.floor(PALLET.d / w)] as const;
    const turned = [Math.floor(PALLET.w / w), Math.floor(PALLET.d / l)] as const;
    const useTurned = turned[0] * turned[1] > straight[0] * straight[1];
    const [nx, nz] = useTurned ? turned : straight;
    const pl = useTurned ? w : l;
    const pw = useTurned ? l : w;
    const perLayer = Math.max(1, nx * nz);
    const perPallet = perLayer * layers;
    // More cartons per pallet wins; among equals, the lower stack is steadier.
    const score = perPallet * 10 - layers * h;
    if (score > bestScore) {
      bestScore = score;
      best = {
        l: pl,
        w: pw,
        h,
        nx: Math.max(1, nx),
        nz: Math.max(1, nz),
        layers,
        perLayer,
        perPallet,
        pallets: 0,
        lastPallet: 0,
        height: PALLET.h + layers * h,
        slots: [],
      };
    }
  }

  const plan = best;
  if (!plan) throw new Error("no way to stand a carton on a pallet");

  plan.pallets = Math.max(1, Math.ceil(cartons / plan.perPallet));
  plan.lastPallet = cartons - (plan.pallets - 1) * plan.perPallet;

  // The pallet on screen is the first, so it is full unless there is only one.
  const shown = Math.min(cartons, plan.perPallet);
  const slots: Slot[] = [];
  for (let layer = 0; layer < plan.layers && slots.length < shown; layer++) {
    for (let iz = 0; iz < plan.nz && slots.length < shown; iz++) {
      for (let ix = 0; ix < plan.nx && slots.length < shown; ix++) {
        slots.push({
          x: (ix - (plan.nx - 1) / 2) * plan.l,
          y: PALLET.h + plan.h * (layer + 0.5),
          z: (iz - (plan.nz - 1) / 2) * plan.w,
        });
      }
    }
  }
  plan.slots = slots;
  plan.height = PALLET.h + Math.ceil(shown / plan.perLayer) * plan.h;
  return plan;
}
