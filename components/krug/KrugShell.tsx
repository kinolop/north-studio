"use client";

import { useEffect, type ReactNode } from "react";

import { KrugFooter } from "./KrugFooter";
import { KrugHeader } from "./KrugHeader";

import "./krug.css";

/**
 * «Круг», whole: its own header and footer around the page.
 *
 * The studio's chrome is suppressed for this route in `StudioChrome`. The
 * body is repainted cobalt while the page is open, so
 * overscroll never flashes the studio's paper through.
 */
export function KrugShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const previous = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#1b2f6e";
    return () => {
      document.body.style.backgroundColor = previous;
    };
  }, []);

  return (
    <div className="kr">
      <KrugHeader />
      {children}
      <KrugFooter />
    </div>
  );
}
