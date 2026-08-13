"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { setScrollLocked } from "@/components/motion/SmoothScroll";
import { CHANNELS } from "@/lib/channels";
import { DURATION, EASE } from "@/lib/motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { BriefForm } from "./BriefForm";
import { ChannelIcon } from "./ChannelIcon";
import type { OverlayMode } from "./ChannelOverlayProvider";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function ChannelOverlay({
  isOpen,
  initialMode,
  prefill,
  onClose,
}: {
  isOpen: boolean;
  initialMode: OverlayMode;
  prefill: string;
  onClose: () => void;
}) {
  const copy = useCopy();
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const [mode, setMode] = useState<OverlayMode>(initialMode);

  useEffect(() => {
    if (isOpen) setMode(initialMode);
  }, [isOpen, initialMode]);

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

      // Contain focus. A dialog that lets Tab wander onto the page behind it
      // is a dialog a keyboard user cannot get out of predictably.
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
    }, 60);

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
          className="fixed inset-0 z-[100] overflow-y-auto"
          initial={reduced ? { opacity: 0 } : { opacity: 0, backdropFilter: "blur(0px)" }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, backdropFilter: "blur(22px)" }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: reduced ? 0.01 : 0.5, ease: EASE.north }}
          style={{ backgroundColor: "rgb(7 8 11 / 0.9)" }}
        >
          {/* Click-out. A button rather than a div so it is reachable and
              announced, but visually it is just the backdrop. */}
          <button
            type="button"
            aria-label={copy.channels.close}
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default"
            tabIndex={-1}
          />

          <div
            ref={panelRef}
            className="relative container-north flex min-h-dvh flex-col justify-center py-24"
          >
            <div className="flex items-start justify-between gap-8">
              <div>
                <p className="label-mono flex items-center gap-3">
                  <span
                    aria-hidden
                    className="inline-block h-1 w-1 rounded-full bg-signal shadow-[0_0_10px_2px_rgb(109_92_255/0.6)]"
                  />
                  <span className="text-signal-lift">355°</span>
                  <span aria-hidden className="h-px w-6 bg-hairline" />
                  {copy.sections.start}
                </p>
                <h2 className="mt-7 font-display text-display font-medium text-bone">
                  {copy.channels.overlayTitle}
                </h2>
                <p className="mt-5 max-w-[44ch] text-lead text-ash">
                  {copy.channels.overlayLede}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label={copy.channels.close}
                className="group mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-hairline transition-colors duration-[var(--duration-state)] ease-[var(--ease-north)] hover:border-signal/50"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-ash transition-colors group-hover:text-bone"
                >
                  <path
                    d="M5 5l14 14M19 5L5 19"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {mode === "choose" ? (
              <ul className="mt-14 grid gap-4 sm:grid-cols-2">
                {CHANNELS.map((channel, index) => (
                  <OptionShell key={channel.id} index={index} reduced={reduced}>
                    <a
                      href={channel.href}
                      {...(channel.external
                        ? { target: "_blank", rel: "noreferrer noopener" }
                        : {})}
                      className="group flex h-full items-start gap-5 p-7"
                    >
                      <Glyph>
                        <ChannelIcon id={channel.id} className="h-5 w-5" />
                      </Glyph>
                      <span className="min-w-0">
                        <span className="block font-display text-[1.35rem] leading-none font-medium tracking-[-0.02em] text-bone">
                          {copy.channels.labels[channel.id]}
                        </span>
                        <span className="data-mono mt-3 block truncate text-signal-lift">
                          {channel.handle}
                        </span>
                        <span className="mt-3 block text-meta text-ash">
                          {copy.channels.notes[channel.id]}
                        </span>
                      </span>
                    </a>
                  </OptionShell>
                ))}

                <OptionShell index={CHANNELS.length} reduced={reduced}>
                  <button
                    type="button"
                    onClick={() => setMode("brief")}
                    className="group flex h-full w-full items-start gap-5 p-7 text-left"
                  >
                    <Glyph>
                      <ChannelIcon id="brief" className="h-5 w-5" />
                    </Glyph>
                    <span className="min-w-0">
                      <span className="block font-display text-[1.35rem] leading-none font-medium tracking-[-0.02em] text-bone">
                        {copy.channels.briefLabel}
                      </span>
                      <span className="mt-3 block text-meta text-ash">
                        {copy.channels.briefNote}
                      </span>
                    </span>
                  </button>
                </OptionShell>
              </ul>
            ) : (
              <motion.div
                className="mt-12 max-w-[46rem]"
                initial={reduced ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION.reveal, ease: EASE.north }}
              >
                <BriefForm prefill={prefill} />
                <button
                  type="button"
                  onClick={() => setMode("choose")}
                  className="label-mono mt-6 text-slate transition-colors duration-[var(--duration-state)] hover:text-ash"
                >
                  ← {copy.channels.back}
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-hairline text-ash transition-[color,border-color] duration-[var(--duration-state)] ease-[var(--ease-north)] group-hover:border-signal/45 group-hover:text-signal-lift">
      {children}
    </span>
  );
}

function OptionShell({
  children,
  index,
  reduced,
}: {
  children: React.ReactNode;
  index: number;
  reduced: boolean;
}) {
  return (
    <motion.li
      className="glass glass-edge overflow-hidden transition-[border-color,transform] duration-[420ms] ease-[var(--ease-north)] hover:-translate-y-0.5 hover:border-signal/30"
      initial={reduced ? false : { opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: DURATION.reveal,
        ease: EASE.north,
        delay: reduced ? 0 : 0.12 + index * 0.06,
      }}
    >
      {children}
    </motion.li>
  );
}
