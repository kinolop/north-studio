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

export type OverlayMode = "choose" | "brief";

export interface OpenOptions {
  /** "brief" jumps straight to the form; the configurator uses this. */
  mode?: OverlayMode;
  /** Seeds the brief form's "what do you need" field. */
  prefill?: string;
}

interface OverlayState {
  open: (options?: OpenOptions) => void;
  close: () => void;
  isOpen: boolean;
}

const OverlayContext = createContext<OverlayState | null>(null);

/**
 * The overlay itself is deferred: it is a whole second screen with a form,
 * and nobody sees it until they ask for it.
 */
const ChannelOverlay = dynamic(
  () => import("./ChannelOverlay").then((m) => m.ChannelOverlay),
  { ssr: false },
);

/**
 * One overlay for the whole page.
 *
 * Every "Start a project" on the site — header, hero, final CTA,
 * configurator — calls the same `open()`. Mounting a dialog per button
 * would mean four copies of the same focus trap and four chances for them
 * to drift apart.
 */
export function ChannelOverlayProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<OverlayMode>("choose");
  const [prefill, setPrefill] = useState("");

  const open = useCallback((options?: OpenOptions) => {
    setMode(options?.mode ?? "choose");
    setPrefill(options?.prefill ?? "");
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<OverlayState>(
    () => ({ open, close, isOpen }),
    [open, close, isOpen],
  );

  return (
    <OverlayContext.Provider value={value}>
      {children}
      <ChannelOverlay
        isOpen={isOpen}
        initialMode={mode}
        prefill={prefill}
        onClose={close}
      />
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
