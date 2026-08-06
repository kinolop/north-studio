/**
 * Motif 3 — the giant ghosted word.
 *
 * Depth through scale rather than through colour: one enormous, almost
 * invisible word sitting behind the glass so the cards read as floating in
 * front of something rather than pasted onto a flat panel. It is set far
 * below the contrast floor on purpose — if you can read it comfortably, it
 * has stopped being a background and started competing.
 *
 * Never contains information. Always aria-hidden.
 */
export function GhostWord({
  children,
  className = "",
  align = "center",
}: {
  children: string;
  className?: string;
  align?: "center" | "left" | "right";
}) {
  const justify =
    align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 flex items-center overflow-hidden ${justify} ${className}`}
    >
      <span
        className="font-display leading-none font-semibold whitespace-nowrap text-bone/[0.022] select-none [font-variation-settings:'wdth'_120]"
        style={{ fontSize: "clamp(9rem, 26vw, 26rem)" }}
      >
        {children}
      </span>
    </div>
  );
}
