"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface OverlayState {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const OverlayContext = createContext<OverlayState | null>(null);

/**
 * The overlay itself is deferred: it is a whole second screen, and nobody
 * sees it until they ask for it.
 */
const ChannelOverlay = dynamic(
  () => import("./ChannelOverlay").then((m) => m.ChannelOverlay),
  { ssr: false },
);

/**
 * One overlay for the whole page.
 *
 * Every "Start a project" on the site — header, hero, both product cases,
 * final CTA — calls the same `open()`. Mounting a dialog per button would
 * mean six copies of the same focus trap and six chances for them to drift
 * apart.
 *
 * `open()` used to take a mode and a prefill so a caller could jump
 * straight to the brief form. The form is gone and no caller ever passed
 * either — every one of them called `open()` bare — so the arguments went
 * with it rather than staying as options that do nothing.
 */
export function ChannelOverlayProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<OverlayState>(
    () => ({ open, close, isOpen }),
    [open, close, isOpen],
  );

  return (
    <OverlayContext.Provider value={value}>
      {children}
      <ChannelOverlay isOpen={isOpen} onClose={close} />
    </OverlayContext.Provider>
  );
}

export function useChannelOverlay(): OverlayState {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error("useChannelOverlay must be used inside <ChannelOverlayProvider>");
  }
  return context;
}
