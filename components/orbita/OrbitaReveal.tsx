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
 * ORBITA's own entrance. Soft, short, and never the studio's expo weight.
 *
 * Content renders visible and is hidden only after JavaScript has confirmed
 * it is genuinely below the fold and that motion is wanted — so no-JS,
 * reduced motion and a mid-page reload all land on "it is simply there",
 * which is the only acceptable way for a reveal to fail.
 */
export function OrbitaReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  /** Milliseconds, for gently staggering a row. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "armed" | "in">("idle");

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight * 0.9) return;

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
        transform: phase === "armed" ? "translateY(16px)" : "none",
        transition:
          phase === "in"
            ? `opacity 720ms var(--o-ease) ${delay}ms, transform 720ms var(--o-ease) ${delay}ms`
            : undefined,
      }}
    >
      {children}
    </div>
  );
}
