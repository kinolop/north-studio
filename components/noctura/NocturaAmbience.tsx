"use client";

/**
 * The lit room the whole page sits in.
 *
 * NOCTURA's brief is warm lamps in the dark, and the failure mode it is
 * guarding against is a section that turns out to be flat black once the
 * photograph above it has scrolled away. So the ground is *rendered*, not
 * painted: a warm vertical gradient with three wide pools of lamp light
 * drifting across it on 61s, 79s and 97s cycles. Coprime-ish periods mean
 * the three never resynchronise, so the page has no visible loop.
 *
 * Fixed rather than per-section, so scrolling moves the content through the
 * light instead of dragging the light along with it. Everything animated
 * here is transform and opacity, so it stays on the compositor and costs
 * the main thread nothing; `prefers-reduced-motion` freezes the drift in
 * the stylesheet while keeping the lit frame.
 */
export function NocturaAmbience() {
  return (
    <>
      <div className="n-ambience" aria-hidden>
        <div className="n-pool-a" />
        <div className="n-pool-b" />
        <div className="n-pool-c" />
      </div>
      {/* Above the content, below the chrome: grain has to fall on the
          photographs too, or the pictures look pasted onto the page. */}
      <div className="n-grain" aria-hidden />
    </>
  );
}
