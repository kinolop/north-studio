/**
 * Hover as a roll of type.
 *
 * Each letter sits in a one-line window with a second copy of itself parked
 * underneath. When the nearest `.group` is hovered or focused, the letters
 * climb out of the window one after another and their copies take their
 * place, left to right, like a split-flap board turning over. Pure CSS: the
 * delays are written once per letter and the parent's state does the rest.
 */
export function RollText({ text, className = "" }: { text: string; className?: string }) {
  const chars = Array.from(text);

  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-flex overflow-hidden leading-[1.2] align-bottom">
        {chars.map((char, index) => (
          <span
            key={index}
            className="relative inline-block transition-transform duration-[520ms] ease-[var(--ease-print)] group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transition-none"
            style={{ transitionDelay: `${index * 14}ms` }}
          >
            <span className="block">{char === " " ? " " : char}</span>
            <span className="absolute top-full left-0 block">{char === " " ? " " : char}</span>
          </span>
        ))}
      </span>
    </span>
  );
}
