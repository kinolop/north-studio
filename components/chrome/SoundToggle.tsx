"use client";

import { useEffect, useRef, useState } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { subscribeScroll } from "@/lib/scroll";
import { isSoundEnabled, playTick, setSoundEnabled } from "@/lib/sound";

const BARS = 4;

/**
 * Task K — the sound switch.
 *
 * Always off on arrival, including for a returning visitor who turned it
 * on last time. Autoplay policy would block it anyway, but the real reason
 * is that a site which makes noise before you ask is a site you close.
 * The stored preference is only used to decide whether to *highlight* the
 * control, never to start audio.
 */
export function SoundToggle() {
  const copy = useCopy();
  const [on, setOn] = useState(false);
  const barsRef = useRef<HTMLSpanElement>(null);

  // Section changes tick, but only once sound is actually on.
  useEffect(() => {
    if (!on) return;
    let last = -1;
    return subscribeScroll(({ index }) => {
      if (index === last) return;
      if (last !== -1) playTick();
      last = index;
    });
  }, [on]);

  function toggle() {
    const next = !isSoundEnabled();
    setSoundEnabled(next);
    setOn(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? copy.sound.disable : copy.sound.enable}
      className="group fixed right-4 bottom-5 z-40 flex items-center gap-2.5 rounded-full border border-hairline bg-void/70 px-3.5 py-2 backdrop-blur-md transition-colors duration-[var(--duration-state)] ease-[var(--ease-north)] hover:border-signal/40 lg:right-6"
    >
      <span ref={barsRef} aria-hidden className="flex items-end gap-[2px]">
        {Array.from({ length: BARS }, (_, i) => (
          <span
            key={i}
            className={[
              "w-[2px] rounded-full transition-[height,background-color] duration-[var(--duration-state)] ease-[var(--ease-north)]",
              on ? "bg-signal-lift" : "bg-slate",
              on ? "motion-safe:animate-[soundBar_1.1s_ease-in-out_infinite]" : "",
            ].join(" ")}
            style={{
              height: on ? "10px" : `${3 + (i % 2) * 2}px`,
              animationDelay: `${i * 130}ms`,
            }}
          />
        ))}
      </span>
      <span className="label-mono transition-colors duration-[var(--duration-state)] group-hover:text-ash">
        {copy.sound.label}
      </span>
    </button>
  );
}
