/**
 * ORBITA's mark: a ring, a body on it, a centre.
 *
 * Deliberately the same drawing family as the compass HUD — hairline
 * geometry, one lit point — because the case has to look like our work
 * while not looking like us. The difference is the argument: the studio's
 * instrument points at north, this one goes around something.
 */
export function OrbitaMark({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`fill-none stroke-orbita ${className}`}
    >
      <circle cx="12" cy="12" r="9.25" strokeWidth="1" opacity="0.55" />
      <circle cx="12" cy="12" r="4.75" strokeWidth="1" opacity="0.3" />
      <circle cx="12" cy="2.75" r="2" className="fill-orbita stroke-none" />
      <circle cx="12" cy="12" r="1.6" className="fill-orbita-lift stroke-none" />
    </svg>
  );
}
