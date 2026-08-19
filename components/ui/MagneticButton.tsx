"use client";

import gsap from "gsap";
import { useEffect, useRef, type ReactNode } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";

interface MagneticButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  /** How far the button may be pulled from rest, in px. */
  pull?: number;
  ariaLabel?: string;
  /**
   * Opens `href` in a new tab. Only meaningful alongside `href`, and it
   * carries its own `rel` — `target="_blank"` without `noopener` hands the
   * opened page a live reference back to this one.
   */
  external?: boolean;
}

/**
 * The primary call to action, and the only magnetic element besides the N.
 *
 * Two things make it feel machined rather than gimmicky: the label travels
 * further than the shell, so the surface parallaxes against its own frame;
 * and the return uses the same expo-out weight as every other motion on the
 * site. The skill's own preset suggested `elastic.out` here — that reads
 * bouncy and cheap against this brand, so it is deliberately power3.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  className = "",
  pull = 12,
  ariaLabel,
  external = false,
}: MagneticButtonProps) {
  const shellRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const shell = shellRef.current;
    const label = labelRef.current;
    if (!shell || !label || reduced) return;

    const settle = { duration: 0.55, ease: "power3.out" } as const;
    const shellX = gsap.quickTo(shell, "x", settle);
    const shellY = gsap.quickTo(shell, "y", settle);
    const labelX = gsap.quickTo(label, "x", settle);
    const labelY = gsap.quickTo(label, "y", settle);

    const onMove = (event: PointerEvent) => {
      const rect = shell.getBoundingClientRect();
      const dx = event.clientX - rect.left - rect.width / 2;
      const dy = event.clientY - rect.top - rect.height / 2;

      shellX((dx / rect.width) * pull * 2);
      shellY((dy / rect.height) * pull * 2);
      // Label overshoots the shell: internal parallax against the frame.
      labelX((dx / rect.width) * pull * 0.9);
      labelY((dy / rect.height) * pull * 0.9);

      shell.style.setProperty("--glow-x", `${event.clientX - rect.left}px`);
      shell.style.setProperty("--glow-y", `${event.clientY - rect.top}px`);
    };

    const onLeave = () => {
      shellX(0);
      shellY(0);
      labelX(0);
      labelY(0);
    };

    shell.addEventListener("pointermove", onMove);
    shell.addEventListener("pointerleave", onLeave);

    return () => {
      shell.removeEventListener("pointermove", onMove);
      shell.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf([shell, label]);
    };
  }, [pull, reduced]);

  const shellClass = [
    "group relative isolate inline-flex items-center gap-4 overflow-hidden",
    "rounded-[var(--radius-control)] border border-hairline",
    "bg-[linear-gradient(180deg,rgb(255_255_255/0.06),rgb(255_255_255/0.015))]",
    "px-8 py-4 text-meta font-medium tracking-[0.02em] text-bone",
    "transition-[border-color,box-shadow] duration-[var(--duration-state)] ease-[var(--ease-north)]",
    "hover:border-signal/45 hover:shadow-lift focus-visible:border-signal/45",
    className,
  ].join(" ");

  const body = (
    <>
      {/* Pointer-tracked bloom. The button is lit by the cursor too. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-[var(--duration-state)] ease-[var(--ease-north)] group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(160px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgb(109 92 255 / 0.38), transparent 70%)",
        }}
      />
      <span ref={labelRef} className="relative flex items-center gap-4">
        {children}
        <svg
          aria-hidden
          viewBox="0 0 24 10"
          className="h-[10px] w-6 overflow-visible text-signal-lift"
        >
          <path
            d="M0 5h21M17 1l4 4-4 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            className="transition-transform duration-[var(--duration-state)] ease-[var(--ease-north)] group-hover:translate-x-1"
          />
        </svg>
      </span>
    </>
  );

  if (href) {
    return (
      <a
        ref={shellRef as React.RefObject<HTMLAnchorElement>}
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
        aria-label={ariaLabel}
        className={shellClass}
      >
        {body}
      </a>
    );
  }

  return (
    <button
      ref={shellRef as React.RefObject<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={shellClass}
    >
      {body}
    </button>
  );
}
