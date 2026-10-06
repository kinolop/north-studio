"use client";

import { useEffect, type ReactNode } from "react";

import { KotelnayaFooter } from "./KotelnayaFooter";
import { KotelnayaHeader } from "./KotelnayaHeader";

import "./kotelnaya.css";

/**
 * «Котельная», whole: its own header and footer around the page. The
 * studio's chrome is suppressed for this route in `StudioChrome`; the body
 * takes the bakery's flour-white so overscroll shows nothing else.
 */
export function KotelnayaShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const previous = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#ecebe6";
    return () => {
      document.body.style.backgroundColor = previous;
    };
  }, []);

  return (
    <div className="kt">
      <KotelnayaHeader />
      {children}
      <KotelnayaFooter />
    </div>
  );
}
