"use client";

import { useEffect, useRef, useState } from "react";

import { NocturaReveal } from "./NocturaReveal";

const COUNT_MS = 1600;

/** Expo-out, so the figure lands the way everything else on this page does. */
const ease = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export interface NocturaFigure {
  readonly key: string;
  readonly value: number | null;
  readonly suffix: string;
  /** Opts out of counting for things that are not quantities, like "24/7". */
  readonly literal?: string;
  readonly label: string;
}

/**
 * A row of illustrative figures that count once, when looked at.
 *
 * Every failure path resolves to the final number: reduced motion, a
 * literal rather than a quantity, a page that loaded already scrolled past
 * the row. A counter stuck on zero is worse than one that never animated,
 * so zero is a starting point and never a resting state.
 */
export function NocturaFigures({
  items,
  note,
}: {
  items: readonly NocturaFigure[];
  note: string;
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
        {items.map((item, index) => (
          <NocturaReveal key={item.key} delay={index * 90} distance={16}>
            <Figure item={item} delay={index * 140} />
          </NocturaReveal>
        ))}
      </div>

      <p className="n-small mt-14 max-w-[62ch]">{note}</p>
    </div>
  );
}

function Figure({ item, delay }: { item: NocturaFigure; delay: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const target = item.value ?? 0;
  const [shown, setShown] = useState(target);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (item.value === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already past it - show the answer rather than replaying the count.
    if (element.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    let frame = 0;
    let timer = 0;
    let start = 0;

    const step = (now: number) => {
      if (start === 0) start = now;
      const t = Math.min((now - start) / COUNT_MS, 1);
      setShown(Math.round(ease(t) * target));
      if (t < 1) frame = window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setShown(0);
        timer = window.setTimeout(() => {
          frame = window.requestAnimationFrame(step);
        }, delay);
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
    };
  }, [target, delay, item.value]);

  return (
    <div>
      <p ref={ref} className="n-figure">
        {item.literal ?? shown}
        {item.suffix}
      </p>
      <p
        className="n-small mt-4 max-w-[18ch]"
        style={{ color: "var(--n-ash)" }}
      >
        {item.label}
      </p>
    </div>
  );
}
