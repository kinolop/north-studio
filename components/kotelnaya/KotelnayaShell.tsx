"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { KotelnayaFooter } from "./KotelnayaFooter";
import { KotelnayaHeader } from "./KotelnayaHeader";
import { useKtMotion } from "./useMotion";

import "./kotelnaya.css";

/**
 * «Котельная», whole: its own header and footer around the page. The
 * studio's chrome is suppressed for this route in `StudioChrome`; the body
 * takes the bakery's coal so overscroll shows nothing else.
 */
export function KotelnayaShell({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useKtMotion(root);

  useEffect(() => {
    const previous = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#141211";
    return () => {
      document.body.style.backgroundColor = previous;
    };
  }, []);

  return (
    <div ref={root} className="kt">
      <KotelnayaHeader />
      {children}
      <KotelnayaFooter />
    </div>
  );
}
