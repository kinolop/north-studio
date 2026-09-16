"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

interface FitLineProps {
  children: ReactNode;
  className?: string;
  /**
   * Font size before measurement, as a CSS length. Close enough that the
   * server-rendered line lands near its final size and the fit is a nudge,
   * not a jump.
   */
  fallback: string;
  as?: "p" | "span" | "div" | "h2";
  ariaHidden?: boolean;
}

/**
 * One line of type, sized so it runs exactly edge to edge.
 *
 * A viewport-unit guess is wrong by a different amount at every width and
 * in every language, because glyph widths are not proportional to the
 * viewport. So the line is measured at a known size and scaled to its
 * container, again whenever the container resizes or the webfont lands.
 */
export function FitLine({
  children,
  className = "",
  fallback,
  as: Tag = "p",
  ariaHidden,
}: FitLineProps) {
  const boxRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const line = lineRef.current;
    if (!box || !line) return;

    const fit = () => {
      const available = box.clientWidth;
      if (available === 0) return;
      line.style.fontSize = "100px";
      const natural = line.getBoundingClientRect().width;
      if (natural === 0) return;
      line.style.fontSize = `${(available / natural) * 100 * 0.995}px`;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    document.fonts?.ready.then(fit).catch(() => {});

    return () => observer.disconnect();
  }, [children]);

  return (
    <Tag
      ref={boxRef as never}
      className={`block w-full ${className}`}
      aria-hidden={ariaHidden}
    >
      <span
        ref={lineRef}
        className="inline-block whitespace-nowrap"
        style={{ fontSize: fallback }}
      >
        {children}
      </span>
    </Tag>
  );
}
