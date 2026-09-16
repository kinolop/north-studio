"use client";

import { createElement, useEffect, useLayoutEffect, useRef } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";

type Tag = "h1" | "h2" | "h3" | "p" | "span" | "div";

interface TypeTextProps {
  /** Authored lines. Each renders as its own block. */
  lines: readonly string[];
  as?: Tag;
  className?: string;
  /** Milliseconds per character. Slow enough to watch, never to wait on. */
  speed?: number;
  /**
   * "view" types when the element reaches the reading line; "manual" waits
   * for `play` to become true (the hero, which waits for the loader).
   */
  trigger?: "view" | "manual";
  play?: boolean;
  /** Called once the last character is down. */
  onDone?: () => void;
  /** Colour class for the caret. */
  caretClassName?: string;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Where on the screen a heading starts typing: a little below the middle. */
const READING_LINE = 0.66;

/**
 * Type, set one letter at a time.
 *
 * Every heading on the page arrives the way it would on a typewriter: the
 * letters land left to right behind a cobalt caret, at a pace you can
 * actually follow. The real text is always in the document for readers and
 * crawlers; only the visible letters are animated.
 *
 * Same fail-safe as the rest of the site's reveals: letters render visible,
 * and are only hidden once JavaScript has confirmed the heading is still
 * below the reading line and motion is wanted. If the visitor scrolls past
 * before the typing finishes, the rest lands at once rather than making
 * them wait for a sentence they have already left.
 */
export function TypeText({
  lines,
  as = "h2",
  className,
  speed = 42,
  trigger = "view",
  play = true,
  onDone,
  caretClassName = "bg-cobalt",
}: TypeTextProps) {
  const rootRef = useRef<HTMLElement>(null);
  const armedRef = useRef(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const reduced = useReducedMotion();
  const text = lines.join("\n");

  // Hide the letters before paint, but only when there is something to wait
  // for: a heading already on screen at load stays exactly as printed.
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    const below = root.getBoundingClientRect().top > window.innerHeight * READING_LINE;
    if (trigger === "manual" || below) {
      armedRef.current = true;
      root.querySelectorAll<HTMLElement>("[data-ch]").forEach((ch) => {
        ch.style.opacity = "0";
      });
    }
    return () => {
      armedRef.current = false;
    };
  }, [text, reduced, trigger]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const chars = [...root.querySelectorAll<HTMLElement>("[data-ch]")];

    if (reduced || !armedRef.current) {
      chars.forEach((ch) => (ch.style.opacity = "1"));
      return;
    }
    if (trigger === "manual" && !play) return;

    // The caret travels between letters, so it lives outside React's tree:
    // React never has to reconcile a node that has moved.
    const caret = document.createElement("span");
    caret.setAttribute("aria-hidden", "true");
    caret.className = `type-caret ${caretClassName}`;

    let frame = 0;
    let started = 0;
    let shown = 0;
    let observer: IntersectionObserver | null = null;

    const finish = () => {
      chars.forEach((ch) => (ch.style.opacity = "1"));
      caret.remove();
      armedRef.current = false;
      doneRef.current?.();
    };

    const tick = (now: number) => {
      if (!started) started = now;
      // Past the heading already: land the rest immediately.
      if (root.getBoundingClientRect().bottom < 0) {
        finish();
        return;
      }
      const target = Math.min(chars.length, Math.floor((now - started) / speed) + 1);
      while (shown < target) {
        chars[shown]!.style.opacity = "1";
        shown += 1;
      }
      const last = chars[shown - 1];
      if (last) last.after(caret);
      if (shown >= chars.length) {
        // Let the caret blink twice on the finished line, then go.
        window.setTimeout(finish, 900);
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    const begin = () => {
      observer?.disconnect();
      frame = window.requestAnimationFrame(tick);
    };

    if (trigger === "manual") {
      begin();
    } else {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) begin();
        },
        { rootMargin: `0px 0px -${Math.round((1 - READING_LINE) * 100)}% 0px` },
      );
      observer.observe(root);
    }

    return () => {
      observer?.disconnect();
      window.cancelAnimationFrame(frame);
      caret.remove();
    };
  }, [text, reduced, trigger, play, speed, caretClassName]);

  let index = 0;

  return createElement(
    as,
    { ref: rootRef, className },
    <>
      <span className="sr-only">{lines.join(" ")}</span>
      {lines.map((line, lineIndex) => (
        <span key={`${line}-${lineIndex}`} aria-hidden className="block">
          {line.split(" ").map((word, wordIndex, words) => (
            <span key={wordIndex} className="inline-block whitespace-nowrap">
              {Array.from(word).map((char) => (
                <span key={index} data-ch={index++}>
                  {char}
                </span>
              ))}
              {wordIndex < words.length - 1 && (
                <span data-ch={index++}>{" "}</span>
              )}
            </span>
          ))}
        </span>
      ))}
    </>,
  );
}
