"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { setScrollLocked } from "@/components/motion/SmoothScroll";
import { CHANNELS } from "@/lib/channels";
import { useReducedMotion } from "@/lib/useReducedMotion";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * The channel chooser.
 *
 * A fresh sheet drops over the page from the top edge and the three ways
 * to reach a person are set as a short index, as large as the headings
 * they came from. One dialog for the whole site: focus is trapped, Escape
 * closes, and focus returns to whatever opened it.
 */
export function ChannelOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const copy = useCopy();
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    setScrollLocked(true);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      );
      if (items.length === 0) return;

      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    }, 80);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
      setScrollLocked(false);
      restoreRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={copy.channels.overlayTitle}
          className="fixed inset-0 z-[100] overflow-y-auto bg-paper text-ink"
          initial={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          animate={reduced ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
          exit={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: reduced ? 0.01 : 0.7, ease: EASE }}
        >
          <div ref={panelRef} className="sheet flex min-h-dvh flex-col py-5">
            <div className="flex items-center justify-between gap-6 border-b border-ink pb-5">
              <p className="text-small font-semibold">{copy.channels.overlayLede}</p>
              <button
                type="button"
                onClick={onClose}
                className="group flex items-center gap-3 text-small font-semibold"
              >
                <span className="ink-link">{copy.channels.close}</span>
                <span aria-hidden className="relative block h-5 w-5 transition-transform duration-500 ease-[var(--ease-print)] group-hover:rotate-90">
                  <span className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 rotate-45 bg-ink" />
                  <span className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 -rotate-45 bg-ink" />
                </span>
              </button>
            </div>

            <h2 className="poster mt-10 text-[clamp(3.5rem,10vw,10rem)] lg:mt-14">
              {copy.channels.overlayTitle}
            </h2>

            <ul className="mt-auto border-t-2 border-ink pt-2">
              {CHANNELS.map((channel, index) => (
                <motion.li
                  key={channel.id}
                  className="border-b border-rule"
                  initial={reduced ? false : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : 0.35 + index * 0.07 }}
                >
                  <a
                    href={channel.href}
                    {...(channel.external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                    className="group grid grid-cols-12 items-baseline gap-x-4 gap-y-2 py-5 lg:py-6"
                  >
                    <span className="poster col-span-12 text-[clamp(3rem,7vw,6.5rem)] transition-[color,transform] duration-500 ease-[var(--ease-print)] group-hover:translate-x-3 group-hover:text-cobalt md:col-span-6">
                      {copy.channels.labels[channel.id]}
                    </span>
                    <span className="col-span-12 text-copy font-semibold break-all md:col-span-3">
                      {channel.handle}
                    </span>
                    <span className="col-span-12 text-small text-ink-soft md:col-span-3">
                      {copy.channels.notes[channel.id]}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
