/**
 * Russian number and plural formatting, written out by hand.
 *
 * `Intl.NumberFormat("ru-RU")` is close, but which space it puts between
 * thousands has changed between ICU versions, and the server and the browser
 * do not always run the same one. A different character between server and
 * client is a hydration mismatch on every number on the page, so the
 * formatting here does not depend on the runtime.
 */

const NBSP = " ";

function group(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

/** 3200 -> "3 200", 38.44 -> "38,4" with one digit. */
export function num(value: number, digits = 0): string {
  const negative = value < 0;
  const fixed = Math.abs(value).toFixed(digits);
  const [whole = "0", fraction] = fixed.split(".");
  return `${negative ? "−" : ""}${group(whole)}${fraction ? `,${fraction}` : ""}`;
}

export const rub = (value: number, digits = 0) => `${num(value, digits)}${NBSP}₽`;

/** Picks the Russian plural class: 1, 21 -> [0]; 2-4 -> [1]; the rest -> [2]. */
export function plural(n: number, forms: readonly [string, string, string]): string {
  const whole = Math.abs(Math.round(n));
  const last = whole % 10;
  const tens = whole % 100;
  if (last === 1 && tens !== 11) return forms[0];
  if (last >= 2 && last <= 4 && (tens < 12 || tens > 14)) return forms[1];
  return forms[2];
}

export const dayWord = (n: number) => plural(n, ["день", "дня", "дней"]);

export const days = (n: number) => `${num(Math.round(n))}${NBSP}${dayWord(Math.round(n))}`;

/** A price with as many digits as it needs to be honest at that size. */
export function priceDigits(value: number): number {
  return value < 10 ? 2 : value < 100 ? 1 : 0;
}

/** Kilometres, or metres for the short hops. */
export function distance(km: number): string {
  return km < 1 ? `${num(km * 1000)}${NBSP}м` : `${num(Math.round(km))}${NBSP}км`;
}
