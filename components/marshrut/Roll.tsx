"use client";

/**
 * A number that turns over like an odometer.
 *
 * Each digit is a column of 0 to 9 slid by a transform, so when the value
 * changes the digits roll to their new places instead of being replaced.
 * Digits are keyed from the right, which keeps the ones and the tens in
 * their columns when a number gains or loses a place. Everything that is not
 * a digit (the comma, the space, the minus) stays where it is.
 */
export function Roll({ value }: { value: string }) {
  const chars = Array.from(value);
  return (
    <span className="mr-roll" role="text" aria-label={value}>
      {chars.map((ch, i) => {
        const key = chars.length - i;
        if (!/\d/.test(ch)) {
          return (
            <span key={key} className="mr-roll-sep" aria-hidden>
              {ch}
            </span>
          );
        }
        const digit = Number(ch);
        return (
          <span key={key} className="mr-digit" aria-hidden>
            <span style={{ transform: `translateY(${-digit}em)` }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <i key={n}>{n}</i>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
