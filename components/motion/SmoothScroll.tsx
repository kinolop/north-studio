"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useLayoutEffect, useRef } from "react";

import { LOCALE_WILL_CHANGE, useLocale } from "@/components/i18n/CopyProvider";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
/**
 * The lock outlives the instance. The loader asks for it before Lenis
 * exists, so a scroller created later has to start stopped rather than
 * miss the request.
 */
let locked = false;

/**
 * Anchor navigation routed through Lenis so nav jumps share the page's
 * easing instead of snapping. Falls back to native scrolling when smooth
 * scroll is off (reduced motion), which is the correct behaviour there.
 */
export function scrollToSection(id: string, { immediate = false }: { immediate?: boolean } = {}) {
  const target = document.getElementById(id);
  if (!target) return;
  // The first screen stays pinned under the sheets that slide over it, so
  // its box never leaves the top of the window and measuring it says "you
  // are already there". The first section is simply the top of the page.
  const first = target === document.querySelector("main section[id]");

  if (lenis) {
    lenis.scrollTo(first ? 0 : target, { offset: 0, duration: 1.4, immediate, force: immediate });
  } else if (first) {
    window.scrollTo(0, 0);
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
export function setScrollLocked(next: boolean) {
  locked = next;
  if (next) lenis?.stop();
  else lenis?.start();
  document.documentElement.style.overflow = next ? "hidden" : "";
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const { locale } = useLocale();
  const firstLocale = useRef(true);
  /** Where the reader was when the language was switched: a section and how far into it. */
  const anchor = useRef<{ id: string; offset: number } | null>(null);

  useEffect(() => {
    const remember = () => {
      const sections = document.querySelectorAll<HTMLElement>("main section[id]");
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.bottom > 0) {
          anchor.current = { id: section.id, offset: Math.max(0, -rect.top) };
          return;
        }
      }
      anchor.current = null;
    };
    window.addEventListener(LOCALE_WILL_CHANGE, remember);
    return () => window.removeEventListener(LOCALE_WILL_CHANGE, remember);
  }, []);

  // A language switch reflows the whole page. The pinned stories are torn
  // down and rebuilt around their new text, and while they are down the
  // page is several screens shorter, which drags the scroll position up
  // with it. This runs after every section has rebuilt and before the frame
  // is painted: each trigger is measured again, top to bottom, and the
  // reader is put back in the section they were reading.
  useLayoutEffect(() => {
    if (firstLocale.current) {
      firstLocale.current = false;
      return;
    }
    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    const saved = anchor.current;
    anchor.current = null;
    const section = saved && document.getElementById(saved.id);
    if (!saved || !section) return;
    const top =
      section.getBoundingClientRect().top +
      window.scrollY +
      Math.min(saved.offset, Math.max(section.offsetHeight - 1, 0));
    // The native position first: Lenis may still believe it is where the
    // reader was, and would skip a jump to a place it thinks it already is.
    window.scrollTo(0, top);
    lenis?.scrollTo(top, { immediate: true, force: true });
    ScrollTrigger.update();
  }, [locale]);

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
    if (locked) instance.stop();

    instance.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    // GSAP's lag smoothing fights a virtual scroller; the ticker must stay honest.
    gsap.ticker.lagSmoothing(0);

    // Pinned sections measure wrong if fonts land after layout.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh);

    // So do triggers below anything that opens and closes (a service row, a
    // question): once the page has settled at its new height, measure again,
    // or a reveal near the end could wait for a scroll position that no
    // longer exists.
    let height = document.body.offsetHeight;
    let settle = 0;
    const grew = new ResizeObserver(() => {
      const next = document.body.offsetHeight;
      if (Math.abs(next - height) < 2) return;
      height = next;
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        ScrollTrigger.refresh();
        height = document.body.offsetHeight;
      }, 250);
    });
    grew.observe(document.body);

    return () => {
      grew.disconnect();
      window.clearTimeout(settle);
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      instance.destroy();
      lenis = null;
    };
  }, [reduced]);

  return <>{children}</>;
}
