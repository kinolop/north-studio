"use client";

import { useEffect, useRef, useState } from "react";

import { useLocale } from "@/components/i18n/CopyProvider";

/** Ease-out. Fast at first, settling — never bouncing. */
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const RUN_MS = 1500;

/**
 * A figure that counts once, when it is looked at.
 *
 * Starts at its final value and only rewinds to zero after confirming the
 * element is below the fold and motion is welcome, so reduced motion, no
 * JavaScript and a mid-page reload all show the number rather than a zero
 * that never moves.
 */
export function OrbitaCounter({
  value,
  decimals = 0,
  suffix = "",
  className = "",
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const { locale } = useLocale();
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let start = 0;
    const quantum = 10 ** decimals;

    const step = (now: number) => {
      if (start === 0) start = now;
      const t = Math.min((now - start) / RUN_MS, 1);
      setShown(Math.round(ease(t) * value * quantum) / quantum);
      if (t < 1) raf = window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setShown(0);
        raf = window.requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(raf);
    };
  }, [value, decimals]);

  const formatted = new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(shown);

  return (
    <span ref={ref} className={className}>
      {formatted}
      {suffix}
    </span>
  );
}
