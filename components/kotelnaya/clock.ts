"use client";

import { useEffect, useState } from "react";

import { moscowMinutes } from "@/lib/kotelnaya/data";

/**
 * Minutes after midnight in Moscow, ticking. Null until the page is on the
 * client: the server cannot know what time the reader is reading, and a
 * guess would flash the wrong batch before hydration corrected it.
 */
export function useMoscowMinutes(): number | null {
  const [min, setMin] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setMin(moscowMinutes());
    tick();
    const t = window.setInterval(tick, 20_000);
    return () => window.clearInterval(t);
  }, []);
  return min;
}
