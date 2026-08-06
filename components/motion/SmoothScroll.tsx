"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

/**
 * Anchor navigation routed through Lenis so nav jumps share the page's
 * easing instead of snapping. Falls back to native scrolling when smooth
 * scroll is off (reduced motion), which is the correct behaviour there.
 */
export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;

  if (lenis) {
    lenis.scrollTo(target, { offset: 0, duration: 1.4 });
  } else {
    target.scrollIntoView({ behavior: "auto", block: "start" });
  }
}

/**
 * Freeze the page behind a full-screen overlay.
 *
 * Lenis has to be stopped as well as the body locked — it drives scroll
 * itself, so `overflow: hidden` alone would leave the virtual scroller
 * happily moving the page underneath the dialog.
 */
export function setScrollLocked(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      // Native scrolling only. Any ScrollTriggers still resolve to their
      // end state immediately because their animations are disabled.
      ScrollTrigger.refresh();
      return;
    }

    const instance = new Lenis({
      duration: 1.15,
      // Expo-out: the scroll settles with the same weight as everything else.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
    });
    lenis = instance;

    instance.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    // GSAP's lag smoothing fights a virtual scroller; the ticker must stay honest.
    gsap.ticker.lagSmoothing(0);

    // Pinned sections measure wrong if fonts land after layout.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      instance.destroy();
      lenis = null;
    };
  }, [reduced]);

  return <>{children}</>;
}
