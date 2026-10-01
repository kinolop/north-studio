import {
  DESTINATIONS,
  MODES,
  ORIGINS,
  PRODUCTS,
  type DestId,
  type ModeId,
  type OriginId,
  type ProductId,
} from "@/lib/marshrut/data";
import type { Input } from "@/lib/marshrut/model";

/**
 * A calculation as a link.
 *
 * The five choices are kept in the address (`#c=3200.tshirt.guangzhou.koledino.rail`),
 * so a figure someone likes can be sent to somebody else and open on exactly
 * that shipment. The fragment is read with the same care as any input from
 * outside: every part must name something the calculator knows, and a
 * link that does not is ignored rather than half-applied.
 */

const KEY = "c=";

export function encode(input: Input): string {
  return `#${KEY}${input.units}.${input.product}.${input.origin}.${input.dest}.${input.mode}`;
}

export function decode(hash: string): Input | null {
  if (!hash.startsWith(`#${KEY}`)) return null;
  const [units, product, origin, dest, mode] = hash.slice(KEY.length + 1).split(".");
  const n = Number(units);
  if (!Number.isFinite(n) || n < 100 || n > 30000) return null;
  if (!PRODUCTS.some((p) => p.id === product)) return null;
  if (!ORIGINS.some((o) => o.id === origin)) return null;
  if (!DESTINATIONS.some((d) => d.id === dest)) return null;
  if (!MODES.some((m) => m.id === mode)) return null;
  return {
    units: Math.round(n),
    product: product as ProductId,
    origin: origin as OriginId,
    dest: dest as DestId,
    mode: mode as ModeId,
  };
}
