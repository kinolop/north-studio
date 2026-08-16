/**
 * ORBITA's mark: a body on a ring, drawn for a light surface.
 *
 * Mint fill, no hairline geometry, no compass — the studio's instrument
 * language is deliberately absent. At 20px this still reads as a planet on
 * an orbit, which is the entire brief for the logo.
 */
export function OrbitaMark({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className}>
      <circle
        cx="12"
        cy="12"
        r="8.6"
        fill="none"
        stroke="var(--o-accent)"
        strokeWidth="2.1"
        opacity="0.34"
      />
      <circle cx="12" cy="12" r="4.4" fill="var(--o-accent)" />
      <circle cx="19.4" cy="7.2" r="2.6" fill="var(--o-accent-deep)" />
    </svg>
  );
}

/** Mark plus wordmark, the way the header and footer both need it. */
export function OrbitaLogo({
  className = "",
  tone = "ink",
}: {
  className?: string;
  tone?: "ink" | "white";
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <OrbitaMark className="h-[22px] w-[22px] shrink-0" />
      <span
        style={{
          color: tone === "white" ? "var(--o-white)" : "var(--o-ink)",
          fontWeight: 650,
          fontSize: "1.12rem",
          letterSpacing: "-0.02em",
        }}
      >
        Orbita
      </span>
    </span>
  );
}
