"use client";

import { useEffect, useRef, useState } from "react";

import { num } from "@/lib/marshrut/format";

/**
 * The page is written as the log of one shipment, and every chapter opens
 * with a log entry: the day, the hour, the place. The hour is invented but
 * fixed for each day, so the same day always reads the same; it is there
 * because a log without hours is a brochure.
 */
export function clock(day: number): string {
  const d = Math.max(0, Math.floor(day));
  // Day 0 is already taken by the morning at the warehouse and the evening's departures: it leaves at night.
  if (d === 0) return "22:40";
  const h = (3 + d * 7) % 24;
  const m = (d * 23 + 10) % 60;
  return `${String(h).padStart(2, "0")}:${String(Math.floor(m / 10) * 10).padStart(2, "0")}`;
}

export function Diary({ day, time, children }: { day: number; time?: string; children: React.ReactNode }) {
  const d = Math.max(0, Math.floor(day + 1e-6));
  return (
    <p className="mr-diary">
      <b className="mr-num">День {num(d)},</b> <span className="mr-num">{time ?? clock(d)}.</span> {children}
    </p>
  );
}

/**
 * A figure that runs up to its value when its chapter takes the screen, the
 * way a counter on a scale settles. It rolls once per arrival and then
 * follows the value directly when the calculation changes.
 */
export function CountUp({ value, play, digits = 0, suffix = "" }: { value: number; play: boolean; digits?: number; suffix?: string }) {
  const [shown, setShown] = useState(value);
  const played = useRef(false);
  const target = useRef(value);
  target.current = value;

  useEffect(() => {
    if (!play) {
      played.current = false;
      setShown(0);
      return;
    }
    if (played.current) {
      setShown(value);
      return;
    }
    played.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / 1300);
      const e = 1 - Math.pow(1 - t, 4);
      setShown(target.current * e);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [play, value]);

  return (
    <>
      {num(shown, digits)}
      {suffix}
    </>
  );
}
