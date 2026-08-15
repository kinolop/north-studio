"use client";

import { useEffect, useLayoutEffect } from "react";

import { resetActiveSections, setActiveSections } from "@/lib/activeSections";
import { remeasureSections } from "@/lib/scroll";
import type { SectionMeta } from "@/lib/sections";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Declares which sections this page has, for the compass and the rail.
 *
 * Registered in a layout effect so the instruments never render a frame
 * against the previous page's anchors, and reset on unmount so navigating
 * back to the home page restores its own sweep.
 */
export function SectionRegistry({ sections }: { sections: readonly SectionMeta[] }) {
  useIsomorphicLayoutEffect(() => {
    setActiveSections(sections);
    remeasureSections();
    return () => {
      resetActiveSections();
      remeasureSections();
    };
  }, [sections]);

  return null;
}
