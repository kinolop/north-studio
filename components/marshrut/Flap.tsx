"use client";

import { useEffect, useRef } from "react";

/**
 * A line of a split-flap departures board.
 *
 * Each character is a tile. When the text changes (or the board is first
 * switched on) every tile that has to change riffles through a few letters
 * before it lands, the ones further right a beat later, which is how a
 * station board reads as a board and not as a font. The flip itself is a
 * short fold about the tile's middle, played with the Web Animations API so
 * nothing re-renders while it runs.
 */

const CHARS = "АБВГДЕЖЗИКЛМНОПРСТУФХЧШЭЯ0123456789";

export function Flap({
  text,
  cells,
  play,
  align = "left",
}: {
  text: string;
  cells?: number;
  play: boolean;
  align?: "left" | "right";
}) {
  const n = Math.max(cells ?? text.length, 1);
  const upper = text.toUpperCase().replace(/ /g, " ");
  const target = (align === "right" ? upper.padStart(n, " ") : upper.padEnd(n, " ")).slice(0, n);
  const root = useRef<HTMLSpanElement>(null);
  const shown = useRef(" ".repeat(n));

  useEffect(() => {
    if (!play) return;
    const el = root.current;
    if (!el) return;
    const faces = Array.from(el.querySelectorAll<HTMLElement>(".mr-flap-face"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const write = (face: HTMLElement, ch: string) => {
      face.textContent = ch === " " ? " " : ch;
    };

    faces.forEach((face, i) => {
      const to = target[i] ?? " ";
      if ((shown.current[i] ?? " ") === to) return;
      if (reduced) {
        write(face, to);
        return;
      }
      const steps = 3 + ((i * 5) % 4);
      for (let k = 1; k <= steps; k++) {
        timers.push(
          setTimeout(
            () => {
              write(face, k === steps ? to : CHARS[(i * 7 + k * 11) % CHARS.length]!);
              face.animate(
                [
                  { transform: "rotateX(0deg)", filter: "brightness(1)" },
                  { transform: "rotateX(-80deg)", filter: "brightness(0.55)", offset: 0.45 },
                  { transform: "rotateX(0deg)", filter: "brightness(1)" },
                ],
                { duration: 70, easing: "ease-out" },
              );
            },
            i * 34 + k * 66,
          ),
        );
      }
    });
    shown.current = target;

    return () => {
      timers.forEach(clearTimeout);
      faces.forEach((face, i) => write(face, target[i] ?? " "));
    };
  }, [target, play]);

  return (
    <span className="mr-flap">
      <span className="mr-sr">{text}</span>
      <span ref={root} className="mr-flap-cells" aria-hidden>
        {Array.from({ length: n }, (_, i) => (
          <span key={i} className="mr-flap-cell">
            <span className="mr-flap-face">{" "}</span>
          </span>
        ))}
      </span>
    </span>
  );
}
