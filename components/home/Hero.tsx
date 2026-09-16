"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { useChannelOverlay } from "@/components/contact/ChannelOverlayProvider";
import { useCopy } from "@/components/i18n/CopyProvider";
import { PrintLines } from "@/components/motion/PrintLines";
import { ScrambleLabel } from "@/components/motion/ScrambleLabel";
import { scrollToSection } from "@/components/motion/SmoothScroll";
import { onIntroDone } from "@/components/paper/introSignal";
import { Section } from "@/components/ui/Section";
import type { ProofCopy } from "@/lib/i18n/types";
import { useOnScreen } from "@/lib/useOnScreen";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { InkButton } from "./InkButton";

/**
 * One correction, start to finish.
 *
 * idle   the server's and reduced motion's state: already corrected
 * type   the sentence is typed out letter by letter
 * await  the pen is handed to the visitor: strike the problem out
 * auto   nobody took it, so the pen strikes it itself
 * fix    the correction is written above by hand
 * hold   the corrected sentence rests
 * erase  it lifts off the sheet for the next one
 */
type Stage = "idle" | "type" | "await" | "auto" | "fix" | "hold" | "erase";

const TYPE_MS_PER_CHAR = 46;
const AWAIT_MS = 4200;
const AUTO_MS = 700;
const FIX_MS = 1100;
const HOLD_MS = 3800;
const ERASE_MS = 650;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * The first screen is a proof sheet, and you hold the pen.
 *
 * A sentence about a problem the visitor recognises is typed onto ruled
 * paper. Then the page hands over the pen: draw through the part that hurts
 * with a mouse or a finger, and your own stroke stays on the page while the
 * fix is written above it by hand. Leave it, and the pen does it for you a
 * few seconds later. Three problems, one for each thing the studio does.
 */
export function Hero() {
  const copy = useCopy();
  const { open } = useChannelOverlay();
  const reduced = useReducedMotion();
  const proofs = copy.hero.proofs;
  const sectionRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(sectionRef, "0px");

  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<Stage>("idle");
  const [byHand, setByHand] = useState(false);
  const [held, setHeld] = useState(false);
  const [ready, setReady] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    setStage("erase");
    return onIntroDone(() => {
      window.setTimeout(() => {
        setReady(true);
        setStage("type");
      }, 250);
    });
  }, [reduced]);

  // Every stage that ends on a clock. `type` ends when the typing does, and
  // `await` ends early when the visitor strikes the line.
  useEffect(() => {
    if (!ready || reduced) return;
    let next: Stage | null = null;
    let ms = 0;
    if (stage === "await") [next, ms] = ["auto", AWAIT_MS];
    if (stage === "auto") [next, ms] = ["fix", AUTO_MS];
    if (stage === "fix") [next, ms] = ["hold", FIX_MS];
    if (stage === "hold" && onScreen && !held) [next, ms] = ["erase", HOLD_MS];
    if (stage === "erase") [next, ms] = ["type", ERASE_MS];
    if (!next) return;
    const target = next;
    const id = window.setTimeout(() => {
      if (target === "type") {
        setIndex((i) => (i + 1) % proofs.length);
        setByHand(false);
      }
      setStage(target);
    }, ms);
    return () => window.clearTimeout(id);
  }, [stage, ready, reduced, onScreen, held, proofs.length]);

  const typed = useCallback(() => setStage((s) => (s === "type" ? "await" : s)), []);
  const struck = useCallback(() => {
    setByHand(true);
    setStage((s) => (s === "await" ? "fix" : s));
  }, []);

  const choose = (next: number) => {
    setIndex(next);
    setByHand(false);
    setHeld(true);
    setStage(reduced ? "idle" : "type");
    window.setTimeout(() => setHeld(false), 12000);
  };

  const proof = proofs[index]!;
  const corrected = stage === "idle" || stage === "fix" || stage === "hold";

  return (
    <Section id="origin" flush className="flex min-h-[100svh] flex-col bg-paper pt-20 pb-8 lg:pt-24">
      <div ref={sectionRef} className="sheet flex flex-1 flex-col">
        <div className="mark flex items-baseline justify-between gap-4 border-b border-ink pb-3 text-ink">
          <ScrambleLabel text={copy.hero.runningHead[1] ?? ""} />
          <ScrambleLabel text={copy.hero.runningHead[2] ?? ""} className="text-right" />
        </div>

        <h1 className="sr-only">{copy.hero.headline}</h1>

        <div className="sheet-grid flex-1 items-center gap-y-10 py-10 lg:py-6">
          <div className="col-span-12 lg:col-span-9">
            <ProofSentence
              key={proof.key}
              proof={proof}
              stage={stage}
              byHand={byHand}
              hint={copy.hero.hint}
              onTyped={typed}
              onStruck={struck}
            />
          </div>

          <aside className="col-span-12 border-l-2 border-cobalt pl-5 lg:col-span-3 lg:pl-6">
            <ul className="flex flex-wrap gap-x-6 gap-y-3 lg:flex-col">
              {proofs.map((item, i) => {
                const active = i === index;
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => choose(i)}
                      aria-pressed={active}
                      className={`relative text-left text-small font-semibold transition-colors ${active ? "text-ink" : "text-ink-mute hover:text-ink"}`}
                    >
                      {item.tab}
                      {/* The active tab is underlined by hand once corrected. */}
                      <svg
                        aria-hidden
                        viewBox="0 0 120 16"
                        preserveAspectRatio="none"
                        className="pointer-events-none absolute -bottom-1.5 left-0 h-2 w-full overflow-visible"
                      >
                        <path
                          d="M2 10 C 30 4, 60 13, 118 6"
                          fill="none"
                          stroke="var(--color-cobalt)"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          vectorEffect="non-scaling-stroke"
                          strokeDasharray="400"
                          style={{
                            strokeDashoffset: active && corrected ? 0 : 400,
                            transition: "stroke-dashoffset 700ms cubic-bezier(0.65,0,0.35,1)",
                          }}
                        />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>

            <p
              aria-live="polite"
              className="mt-6 max-w-[34ch] text-copy text-ink lg:mt-10"
              style={{
                opacity: corrected ? 1 : 0,
                transform: corrected ? "none" : "translateY(10px)",
                transition: corrected
                  ? "opacity 700ms ease 350ms, transform 900ms cubic-bezier(0.22,1,0.36,1) 350ms"
                  : "opacity 250ms ease, transform 250ms ease",
              }}
            >
              {proof.note}
            </p>
          </aside>
        </div>

        <div className="sheet-grid items-end gap-y-6 border-t border-ink pt-5">
          <div className="col-span-12 md:col-span-7 lg:col-span-6">
            <PrintLines
              text={copy.hero.lede}
              className="max-w-[46ch] text-copy text-ink-soft"
              start="top bottom"
              delay={2.6}
            />
          </div>
          <div className="col-span-12 flex flex-wrap items-center gap-x-8 gap-y-4 md:col-span-5 md:justify-end lg:col-span-6">
            <a
              href="#services"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("services");
              }}
              className="ink-link text-small font-semibold text-ink"
            >
              {copy.hero.secondary}
            </a>
            <InkButton onClick={() => open()}>{copy.studio.startProject}</InkButton>
          </div>
        </div>
      </div>
    </Section>
  );
}

interface Point {
  x: number;
  y: number;
}

/** How much of the struck words a stroke must cross, left to right. */
const COVERAGE = 0.72;
const BINS = 36;

/**
 * One sentence, the pen, and the correction.
 *
 * Typing is driven straight on the letter nodes, not through React state, so
 * a forty-letter sentence is forty style writes rather than forty renders.
 * The visitor's stroke is drawn on a canvas laid over the sentence and
 * measured against the struck words: once it has crossed most of their
 * width inside their line, the problem counts as struck.
 */
function ProofSentence({
  proof,
  stage,
  byHand,
  hint,
  onTyped,
  onStruck,
}: {
  proof: ProofCopy;
  stage: Stage;
  byHand: boolean;
  hint: string;
  onTyped: () => void;
  onStruck: () => void;
}) {
  const sheetRef = useRef<HTMLParagraphElement>(null);
  const struckRef = useRef<HTMLSpanElement>(null);
  const fixRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [alignRight, setAlignRight] = useState(false);

  const shown = stage !== "erase";
  const typing = stage === "type";
  const awaiting = stage === "await";
  const fixed = stage === "idle" || stage === "fix" || stage === "hold";
  const autoStruck = stage === "idle" || stage === "auto" || (fixed && !byHand);
  const instant = stage === "idle";

  // Typing.
  useIsomorphicLayoutEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const chars = [...sheet.querySelectorAll<HTMLElement>("[data-ch]")];
    if (!typing) {
      chars.forEach((ch) => (ch.style.opacity = ""));
      return;
    }
    chars.forEach((ch) => (ch.style.opacity = "0"));
    const caret = document.createElement("span");
    caret.className = "type-caret bg-cobalt";
    caret.setAttribute("aria-hidden", "true");
    let frame = 0;
    let timer = 0;
    let started = 0;
    let count = 0;
    const tick = (now: number) => {
      if (!started) started = now;
      const target = Math.min(chars.length, Math.floor((now - started) / TYPE_MS_PER_CHAR) + 1);
      while (count < target) chars[count++]!.style.opacity = "1";
      chars[count - 1]?.after(caret);
      if (count >= chars.length) {
        timer = window.setTimeout(() => {
          caret.remove();
          onTyped();
        }, 450);
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      caret.remove();
    };
  }, [typing, onTyped]);

  // A correction near the end of a line would run off the sheet.
  useIsomorphicLayoutEffect(() => {
    const target = struckRef.current;
    const note = fixRef.current;
    const sheet = sheetRef.current;
    if (!target || !note || !sheet) return;
    const measure = () => {
      const room = sheet.getBoundingClientRect().right - target.getBoundingClientRect().left;
      setAlignRight(note.scrollWidth > room);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [proof.key]);

  // The pen.
  useEffect(() => {
    const sheet = sheetRef.current;
    const canvas = canvasRef.current;
    const target = struckRef.current;
    if (!sheet || !canvas || !target) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = () => {
      const rect = sheet.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      // Resizing a canvas wipes it, so only do it when the size really moved.
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const resize = new ResizeObserver(size);
    resize.observe(sheet);

    if (stage === "type" || stage === "erase" || (!byHand && !awaiting)) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (!awaiting) return () => resize.disconnect();

    const cobalt =
      getComputedStyle(document.documentElement).getPropertyValue("--color-cobalt").trim() || "#1b2ed8";
    const bins = new Array<boolean>(BINS).fill(false);
    let last: Point | null = null;
    let mid: Point | null = null;
    let pressing = false;
    let done = false;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const local = (event: PointerEvent): Point => {
      const rect = sheet.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const band = () => {
      const s = sheet.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      return {
        left: t.left - s.left,
        right: t.right - s.left,
        top: t.top - s.top + t.height * 0.12,
        bottom: t.bottom - s.top - t.height * 0.02,
      };
    };

    const draw = (point: Point) => {
      if (!last || !mid) {
        last = point;
        mid = point;
        return;
      }
      const next = { x: (last.x + point.x) / 2, y: (last.y + point.y) / 2 };
      ctx.strokeStyle = cobalt;
      ctx.lineWidth = parseFloat(getComputedStyle(sheet).fontSize) * 0.085;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(mid.x, mid.y);
      ctx.quadraticCurveTo(last.x, last.y, next.x, next.y);
      ctx.stroke();
      mid = next;
      last = point;
    };

    const measure = (point: Point) => {
      const b = band();
      if (point.y < b.top || point.y > b.bottom) return;
      const t = (point.x - b.left) / Math.max(b.right - b.left, 1);
      if (t < 0 || t > 1) return;
      bins[Math.min(BINS - 1, Math.floor(t * BINS))] = true;
      if (!done && bins.filter(Boolean).length / BINS >= COVERAGE) {
        done = true;
        onStruck();
      }
    };

    const nearWords = (point: Point) => {
      const b = band();
      const pad = (b.bottom - b.top) * 0.9;
      return (
        point.y > b.top - pad &&
        point.y < b.bottom + pad &&
        point.x > b.left - pad &&
        point.x < b.right + pad
      );
    };

    const onMove = (event: PointerEvent) => {
      const point = local(event);
      // A mouse draws just by passing over the words; a finger has to press.
      if (pressing || (fine && nearWords(point))) {
        draw(point);
        measure(point);
      } else {
        last = null;
      }
    };
    const onDown = (event: PointerEvent) => {
      const point = local(event);
      if (!nearWords(point)) return;
      pressing = true;
      sheet.setPointerCapture(event.pointerId);
      last = null;
      draw(point);
    };
    const onUp = (event: PointerEvent) => {
      pressing = false;
      last = null;
      if (sheet.hasPointerCapture(event.pointerId)) sheet.releasePointerCapture(event.pointerId);
    };
    const onLeave = () => {
      last = null;
    };

    sheet.addEventListener("pointermove", onMove);
    sheet.addEventListener("pointerdown", onDown);
    sheet.addEventListener("pointerup", onUp);
    sheet.addEventListener("pointercancel", onUp);
    sheet.addEventListener("pointerleave", onLeave);

    return () => {
      resize.disconnect();
      sheet.removeEventListener("pointermove", onMove);
      sheet.removeEventListener("pointerdown", onDown);
      sheet.removeEventListener("pointerup", onUp);
      sheet.removeEventListener("pointercancel", onUp);
      sheet.removeEventListener("pointerleave", onLeave);
    };
  }, [awaiting, byHand, stage, onStruck]);

  const letters = (text: string) =>
    text.split(" ").map((word, wi, words) => (
      <span key={wi} className="inline-block whitespace-nowrap">
        {Array.from(word).map((char, ci) => (
          <span key={ci} data-ch>
            {char}
          </span>
        ))}
        {wi < words.length - 1 && <span data-ch>{" "}</span>}
      </span>
    ));

  return (
    <p
      ref={sheetRef}
      aria-hidden
      className="proof-ruled relative min-h-[4.5em] text-[clamp(2.3rem,5.5vw,6.4rem)] leading-[1.5] font-bold tracking-[-0.035em] text-ink select-none [--rule-step:1.5em]"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(-0.25em)",
        transition: instant
          ? "none"
          : shown
            ? "opacity 200ms ease"
            : `opacity ${ERASE_MS}ms ease, transform ${ERASE_MS}ms cubic-bezier(0.76,0,0.24,1)`,
        cursor: awaiting ? "crosshair" : undefined,
      }}
    >
      {letters(proof.before.trimEnd())}
      {proof.before.endsWith(" ") && <span data-ch>{" "}</span>}
      <span
        ref={struckRef}
        className="relative inline-block whitespace-nowrap"
        style={{ touchAction: awaiting ? "none" : undefined }}
      >
        <span
          style={{
            color: fixed || stage === "auto" ? "var(--color-ink-mute)" : "var(--color-ink)",
            transition: instant ? "none" : "color 500ms ease 150ms",
          }}
        >
          {letters(proof.struck)}
        </span>

        {/* The pen's own strike, for when nobody took the pen. */}
        <svg
          aria-hidden
          viewBox="0 0 100 12"
          preserveAspectRatio="none"
          className="pointer-events-none absolute top-[46%] -left-[0.5%] h-[0.22em] w-[101%] overflow-visible"
        >
          <path
            d="M0 7 C 12 3, 24 9, 38 6 S 62 3, 76 7 S 94 5, 100 4"
            fill="none"
            stroke="var(--color-cobalt)"
            strokeWidth="0.09em"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            strokeDasharray="4000"
            style={{
              strokeDashoffset: autoStruck && shown ? 0 : 4000,
              transition: instant ? "none" : "stroke-dashoffset 650ms cubic-bezier(0.65,0,0.35,1)",
            }}
          />
        </svg>

        {/* The invitation, while the pen is on offer. */}
        <span
          className="pointer-events-none absolute top-[96%] left-0 flex items-start gap-2 font-[family-name:var(--font-hand)] text-[max(0.3em,1.2rem)] leading-none font-semibold tracking-normal whitespace-nowrap text-cobalt"
          style={{
            opacity: awaiting ? 1 : 0,
            transform: awaiting ? "none" : "translateY(-0.3em)",
            transition: "opacity 400ms ease, transform 500ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <svg viewBox="0 0 30 30" className="hero-hint-arrow h-[1.2em] w-[1.2em] overflow-visible" aria-hidden>
            <path
              d="M4 26 C 6 16, 12 8, 24 5 M16 3 24 5 20 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="pt-[0.5em]">{hint}</span>
        </span>

        <svg
          aria-hidden
          viewBox="0 0 20 14"
          className="pointer-events-none absolute bottom-[0.02em] h-[0.26em] w-[0.36em]"
          style={{
            left: alignRight ? "auto" : "-0.16em",
            right: alignRight ? "-0.16em" : "auto",
            opacity: fixed && shown ? 1 : 0,
            transition: instant ? "none" : "opacity 300ms ease",
          }}
        >
          <path d="M2 12 10 2 18 12" fill="none" stroke="var(--color-cobalt)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <span
          ref={fixRef}
          className="pointer-events-none absolute bottom-[74%] font-[family-name:var(--font-hand)] text-[0.58em] leading-none font-semibold tracking-normal whitespace-nowrap text-cobalt"
          style={{
            left: alignRight ? "auto" : "0",
            right: alignRight ? "0" : "auto",
            transform: "rotate(-2.5deg)",
            transformOrigin: alignRight ? "right bottom" : "left bottom",
            clipPath: fixed && shown ? "inset(-20% -4% -30% -4%)" : "inset(-20% 104% -30% -4%)",
            transition: instant ? "none" : "clip-path 1000ms cubic-bezier(0.45,0,0.2,1)",
          }}
        >
          {proof.fix}
        </span>
      </span>
      {Array.from(proof.after).map((char, i) => (
        <span key={i} data-ch>
          {char}
        </span>
      ))}
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
    </p>
  );
}
