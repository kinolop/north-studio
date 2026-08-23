"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * MONOLITH's entrance. Slow, weighted, and it never overshoots.
 *
 * Content renders visible and is hidden only after JavaScript has confirmed
 * it is genuinely below the fold and that motion is wanted — so no-JS,
 * reduced motion and a mid-page reload all land on "it is simply there",
 * which is the only acceptable way for a reveal to fail.
 *
 * Under reduced motion the travel is dropped entirely and nothing is armed,
 * which is the page-wide rule: opacity is the only property allowed to
 * change when a visitor has asked for calm.
 */
export function MonolithReveal({
  children,
  delay = 0,
  distance = 18,
  className = "",
}: {
  children: ReactNode;
  /** Milliseconds, for staggering a row. */
  delay?: number;
  /** Pixels of travel. Set 0 for things that should only fade. */
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "armed" | "in">("idle");

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    setPhase("armed");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setPhase("in");
        observer.disconnect();
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: phase === "armed" ? 0 : 1,
        transform:
          phase === "armed" && distance > 0
            ? `translateY(${distance}px)`
            : "none",
        transition:
          phase === "in"
            ? `opacity 900ms var(--m-ease) ${delay}ms, transform 900ms var(--m-ease) ${delay}ms`
            : undefined,
      }}
    >
      {children}
    </div>
  );
}
