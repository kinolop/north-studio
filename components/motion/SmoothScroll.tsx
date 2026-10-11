"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

import { LOCALE_WILL_CHANGE, useLocale } from "@/components/i18n/CopyProvider";
import { isTouchScreen } from "@/lib/touch";
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
 * Where the reader stood on the home page when they followed a link out of
 * it, so the back button can put them in front of the same work again.
 */
let homeY = 0;
/** The route change in progress came from the back or forward button. */
let fromHistory = false;

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
    return;
  }
  // A touch screen scrolls natively, and glides there natively too. Reduced
  // motion jumps.
  const still = immediate || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = first ? 0 : target.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top, behavior: still ? "auto" : "smooth" });
}

/**
 * Page-height changes smaller than this are not worth re-measuring every
 * scroll animation for: a trigger a few pixels off is invisible, while a
 * refresh is a full pass over every one of them.
 */
const REFRESH_THRESHOLD = 24;

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
  const pathname = usePathname();
  const firstPath = useRef(true);

  useEffect(() => {
    const leave = (event: MouseEvent) => {
      if (window.location.pathname !== "/") return;
      if ((event.target as Element | null)?.closest?.("a[href]")) homeY = window.scrollY;
    };
    const pop = () => {
      fromHistory = true;
    };
    document.addEventListener("click", leave, true);
    window.addEventListener("popstate", pop);
    return () => {
      document.removeEventListener("click", leave, true);
      window.removeEventListener("popstate", pop);
    };
  }, []);

  // One scroller serves every page, and it keeps the position of whatever
  // page it last moved. Next.js only lifts a new page to the top when the
  // page's first element is out of view, and a case opens on a fixed stage
  // that is always in view, so a case used to open wherever the previous
  // page had stopped: halfway down, or at its end. Every page now opens at
  // its top. The home page, reached with the back button, opens where the
  // reader left it, once its pinned sections have been measured again.
  useLayoutEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    const back = fromHistory;
    fromHistory = false;
    if (window.location.hash && !back) return;

    const jump = (top: number) => {
      window.scrollTo(0, top);
      if (!lenis) return;
      // Lenis still holds the height of the page it came from, and may still
      // be gliding towards a spot on it. It measures the new page, and a stop
      // and start drops the glide and takes up the native position as its own.
      lenis.resize();
      if (!lenis.isStopped) {
        lenis.stop();
        lenis.start();
      }
    };
    jump(0);
    if (pathname !== "/" || !back || homeY === 0) {
      ScrollTrigger.refresh();
      return;
    }
    // The rebuilt page grows over a few frames while its sections mount and
    // pin, so wait until it is tall enough to hold the old position (with a
    // fresh measure every few frames), and give up after about a second.
    const target = homeY;
    let frame = 0;
    let tries = 0;
    const settle = () => {
      const max = () => document.documentElement.scrollHeight - window.innerHeight;
      if (max() < target && tries < 60) {
        tries += 1;
        if (tries % 10 === 0) ScrollTrigger.refresh();
        frame = requestAnimationFrame(settle);
        return;
      }
      ScrollTrigger.refresh();
      jump(Math.min(target, max()));
      ScrollTrigger.update();
    };
    frame = requestAnimationFrame(settle);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

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
    // Pinned sections measure wrong if fonts land after layout.
    const refresh = () => ScrollTrigger.refresh();

    // So do triggers below anything that opens and closes (a service row, a
    // question): once the page has settled at its new height, measure again,
    // or a reveal near the end could wait for a scroll position that no
    // longer exists.
    let height = document.body.offsetHeight;
    let settle = 0;
    const grew = new ResizeObserver(() => {
      const next = document.body.offsetHeight;
      if (Math.abs(next - height) < REFRESH_THRESHOLD) return;
      height = next;
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        ScrollTrigger.refresh();
        height = document.body.offsetHeight;
      }, 250);
    });

    // A finger already scrolls with the phone's own momentum, and Lenis
    // leaves touch alone anyway: all it would add there is a frame loop
    // that never sleeps.
    if (reduced || isTouchScreen()) {
      // Native scrolling only. Under reduced motion any ScrollTriggers
      // still resolve to their end state immediately because their
      // animations are disabled.
      if (reduced) ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh).catch(() => {});
      grew.observe(document.body);
      return () => {
        grew.disconnect();
        window.clearTimeout(settle);
      };
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

    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh);
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
