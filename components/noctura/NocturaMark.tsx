"use client";

import { NOCTURA } from "@/lib/noctura";

/**
 * The wordmark.
 *
 * Purely typographic, like every hotel it is benchmarked against - Aman,
 * Bulgari and Edition all resolve to a name in a good face with the letters
 * pushed apart, and a drawn logotype would look like a startup's. The one
 * liberty is the lit "O": a small warm halo behind the second letter, so
 * the mark carries a single window burning in a dark tower. It is the
 * cheapest possible statement of what the brand is about, and it is the
 * only decoration the mark gets.
 */
export function NocturaMark({
  size = "md",
  withTagline = false,
}: {
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
}) {
  const scale = size === "lg" ? "clamp(1.6rem, 3vw, 2.6rem)" : size === "sm" ? "0.95rem" : "1.2rem";

  return (
    <span
      className="inline-flex flex-col"
      style={{ gap: withTagline ? "0.6rem" : 0 }}
    >
      <span
        style={{
          fontFamily: "var(--font-cormorant), serif",
          fontSize: scale,
          fontWeight: 400,
          letterSpacing: "0.42em",
          lineHeight: 1,
          color: "var(--n-ivory)",
          // The tracking adds a trailing gap after the last letter; pulling
          // it back keeps the mark optically centred in its own box.
          marginRight: "-0.42em",
          whiteSpace: "nowrap",
        }}
      >
        N
        <span style={{ position: "relative", display: "inline-block" }}>
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "2.4em",
              height: "2.4em",
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgb(200 169 106 / 0.42), transparent 62%)",
              pointerEvents: "none",
            }}
          />
          <span style={{ position: "relative" }}>O</span>
        </span>
        CTURA
      </span>

      {withTagline && (
        <span
          className="n-label n-label-dim"
          style={{ fontSize: "0.5625rem", letterSpacing: "0.4em" }}
        >
          {NOCTURA.brand.tagline}
        </span>
      )}
    </span>
  );
}
