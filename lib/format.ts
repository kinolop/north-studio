/**
 * Number formatting, in the reader's language.
 *
 * The site's rule is that numerals are identical across locales — but their
 * *punctuation* is not: 0.8 in English is 0,8 in Russian, and a figure with
 * the wrong separator is the fastest way to look machine-translated. One
 * function, so no surface can drift from the others.
 */
export function formatNumber(
  value: number,
  locale: string,
  decimals = 0,
): string {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
