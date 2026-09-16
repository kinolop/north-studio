"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { setScrollLocked } from "@/components/motion/SmoothScroll";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { markIntroDone } from "./introSignal";
import { Logo } from "./Logo";

const COUNT_MS = 1900;
const FLY_MS = 950;
const RULES = 9;

type Phase = "count" | "fly" | "gone";

/**
 * Whether the loader has already run in this document. Module scope, so a
 * client-side navigation back to the home page does not replay it, while a
 * fresh load or a refresh always does.
 */
let played = false;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * The loader.
 *
 * A blank sheet rules itself: lines draw across it one after another while
 * the counter runs to a hundred and the name sits in the middle. At a
 * hundred the sheet lifts away, and the name does not vanish with it: it
 * travels from the centre of the screen into its place in the header and
 * shrinks to fit, so the first thing you saw is the thing still there.
 *
 * The flight is measured, not guessed. The loader reads the header logo's
 * box and animates a transform between the two rectangles, so it lands on
 * the exact pixel at every viewport size.
 */
export function Intro() {
  const copy = useCopy();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(played ? "gone" : "count");
  const logoRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const timers = useRef<number[]>([]);
  const [flight, setFlight] = useState<string | null>(null);

  const land = useCallback(() => {
    document.documentElement.classList.remove("intro-running");
    setPhase("gone");
  }, []);

  const lift = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];

    const logo = logoRef.current;
    const anchor = document.querySelector<HTMLElement>("[data-logo-anchor]");
    if (logo && anchor) {
      const from = logo.getBoundingClientRect();
      const to = anchor.getBoundingClientRect();
      const scale = to.height / Math.max(from.height, 1);
      setFlight(
        `translate3d(${to.left - from.left}px, ${to.top - from.top}px, 0) scale(${scale})`,
      );
    }

    setPhase("fly");
    markIntroDone();
    setScrollLocked(false);
    timers.current.push(window.setTimeout(land, FLY_MS + 40));
  }, [land]);

  // Which mounted instance owns this document's single run. Strict mode
  // mounts twice in development; the second pass must not mistake the first
  // pass's claim for an earlier visit.
  const ownerRef = useRef(false);

  useIsomorphicLayoutEffect(() => {
    if (!played) {
      played = true;
      ownerRef.current = true;
    }
    if (!ownerRef.current) {
      markIntroDone();
      return;
    }
    document.documentElement.classList.add("intro-running");
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    return () => document.documentElement.classList.remove("intro-running");
  }, []);

  useEffect(() => {
    if (phase !== "count" || !ownerRef.current) return;

    // Synchronous on purpose. A frame callback here would never run in a
    // background tab until it was shown, which could be after the loader had
    // already unlocked, and would lock the page for good.
    setScrollLocked(true);

    const total = reduced ? 450 : COUNT_MS;
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min((now - started) / total, 1);
      // Fast start, a hesitation near the end: how a real load feels.
      const eased = t < 0.7 ? (t / 0.7) * 0.86 : 0.86 + ((t - 0.7) / 0.3) * 0.14;
      if (counterRef.current) {
        counterRef.current.textContent = String(Math.round(eased * 100)).padStart(3, "0");
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${eased})`;
      if (t < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    timers.current.push(window.setTimeout(lift, total + 160));

    return () => {
      window.cancelAnimationFrame(frame);
      setScrollLocked(false);
    };
    // `phase` is deliberately the only trigger: the count runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  if (phase === "gone") return null;

  const flying = phase === "fly";

  return (
    <>
      {/* The sheet. */}
      <div
        role="status"
        aria-label={copy.intro.label}
        className="north-intro fixed inset-0 z-[150] overflow-hidden bg-paper"
        style={{
          clipPath: flying ? "inset(0 0 100% 0)" : "inset(0 0 0% 0)",
          transition: `clip-path ${FLY_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`,
        }}
      >
        <div aria-hidden className="absolute inset-0">
          {Array.from({ length: RULES }, (_, i) => (
            <span
              key={i}
              className="intro-rule absolute inset-x-0 h-px origin-left bg-rule"
              style={{
                top: `${((i + 1) * 100) / (RULES + 1)}%`,
                animationDelay: reduced ? "0ms" : `${80 + i * 90}ms`,
              }}
            />
          ))}
          <span
            className="intro-margin absolute top-0 bottom-0 w-px origin-top bg-cobalt"
            style={{ left: "calc(var(--spacing-page) * 0.5)" }}
          />
        </div>

        <div className="sheet absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 pb-6">
          <span className="poster text-[clamp(5rem,17vw,15rem)] leading-[0.78] text-ink tabular-nums">
            <span ref={counterRef}>000</span>
          </span>
          <button
            type="button"
            onClick={lift}
            className="mark ink-link mb-2 text-ink-soft hover:text-ink"
          >
            {copy.intro.skip}
          </button>
        </div>
      </div>

      {/* The name, on its own layer so the lifting sheet cannot clip it. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[151] flex flex-col items-center justify-center"
        style={{
          opacity: flying && !flight ? 0 : 1,
          transition: flying && !flight ? `opacity ${FLY_MS}ms ease` : undefined,
        }}
      >
        <div
          ref={logoRef}
          className="origin-top-left text-[clamp(2.6rem,7.2vw,6.8rem)] text-ink"
          style={{
            transform: flying && flight ? flight : "none",
            transition: flying ? `transform ${FLY_MS}ms cubic-bezier(0.76, 0, 0.24, 1)` : undefined,
          }}
        >
          <Logo />
        </div>
        <span
          className="mt-8 block h-[2px] w-[min(26rem,62vw)] bg-rule transition-opacity duration-300"
          style={{ opacity: flying ? 0 : 1 }}
        >
          <span ref={barRef} className="block h-full origin-left scale-x-0 bg-cobalt" />
        </span>
      </div>
    </>
  );
}
