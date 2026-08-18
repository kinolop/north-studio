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
 * NOCTURA's entrance: slow, weighted, and never bouncy.
 *
 * Longer and gentler than either of the other two brands on this site -
 * 1100ms with a 22px rise, because the whole page is trying to feel like a
 * film rather than a product tour.
 *
 * The logic is inverted on purpose. Content renders *visible* and is hidden
 * only after JavaScript has confirmed it is genuinely below the fold and
 * that motion is wanted. So every failure path - no JS, reduced motion, a
 * deep link, a mid-page reload, browser scroll restoration - lands on "the
 * content is simply there", which is the only acceptable way for a reveal
 * to fail. The alternative strands paragraphs at opacity 0 forever.
 */
/**
 * The tags this is allowed to become. A closed union rather than
 * `ElementType` because the reveal has to be able to be an `<li>` inside a
 * list - wrapping list items in a div is invalid HTML - and nothing here
 * needs to render an arbitrary component.
 */
type RevealTag = "div" | "section" | "article" | "figure" | "li" | "p" | "span";

export function NocturaReveal({
  children,
  delay = 0,
  as = "div",
  className = "",
  /** Vertical travel in px. Larger for display type, smaller for rows. */
  distance = 22,
}: {
  children: ReactNode;
  delay?: number;
  as?: RevealTag;
  className?: string;
  distance?: number;
}) {
  // TypeScript resolves JSX props from the tag name, and a *union* of names
  // widens every prop to `never`. Every tag in RevealTag takes the same
  // three props being passed, so the element is typed as one of them while
  // the real name is what actually reaches the DOM.
  const Tag = as as "div";
  // Typed to match the cast above; every tag in RevealTag inherits the
  // only member read here, getBoundingClientRect.
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "armed" | "in">("idle");

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen: leave it alone. Animating what the visitor is
    // already looking at is the clearest tell of a generated page.
    if (element.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    setPhase("armed");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setPhase("in");
        observer.disconnect();
      },
      // threshold 0 with a negative bottom margin, so sections taller than
      // the viewport still fire - a fractional threshold never would.
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: phase === "armed" ? 0 : 1,
        transform: phase === "armed" ? `translateY(${distance}px)` : "none",
        transition:
          phase === "in"
            ? `opacity 1100ms var(--n-ease) ${delay}ms, transform 1100ms var(--n-lift) ${delay}ms`
            : undefined,
      }}
    >
      {children}
    </Tag>
  );
}
