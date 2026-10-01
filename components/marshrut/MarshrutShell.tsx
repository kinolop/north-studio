"use client";

import { useEffect, type ReactNode } from "react";

import { Loader } from "./Loader";
import { MarshrutFooter } from "./MarshrutFooter";
import { MarshrutHeader } from "./MarshrutHeader";

import "./marshrut.css";
import "./sections.css";
import "./loader.css";

/**
 * МАРШРУТ, whole: its own loader, header and footer around the page.
 *
 * The studio's chrome is suppressed for this route in `StudioChrome`, so the
 * only thing shared with North Studio is the smooth-scroll wrapper. The body
 * is repainted night while the page is open, so overscroll and
 * rubber-banding never flash anything else through.
 */
export function MarshrutShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const previous = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#0c0d0f";
    return () => {
      document.body.style.backgroundColor = previous;
    };
  }, []);

  return (
    <div className="mr">
      {/* Without scripting the doors would never open, and nothing would ever mark itself as seen. */}
      <noscript>
        <style>{`.mr-loader{display:none!important}.mr-hero .mr-copy,.mr-hero .mr-ticket,.mr-panel>*{opacity:1!important;translate:none!important}`}</style>
      </noscript>
      <Loader />
      <MarshrutHeader />
      {children}
      <MarshrutFooter />
    </div>
  );
}
