"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useLayoutEffect, useRef, type ReactNode } from "react";

import { num } from "@/lib/marshrut/format";

import { useMoment } from "./moment";

gsap.registerPlugin(SplitText);

/**
 * One stop on the journey.
 *
 * Every chapter opens with a kilometre post, a white plate with the distance
 * the cargo has come and the place it has come to, set on a line across the
 * whole screen. It scrolls up past the reader like a marker on a road
 * passing a car window, and it is the page's divider: between chapters the
 * reader does not cross a margin, they cross a milestone.
 *
 * The panel beside the map is pinned while the chapter's own stretch of the
 * journey plays out behind it. It opens straight on its headline: the post
 * has already said where the reader is. It knows when its chapter holds the
 * screen, and its contents arrive then: the headline rises line by line
 * out of a mask, the rest fades up after it. The split happens in a layout
 * effect, before the browser paints the newly visible headline, so it never
 * flashes whole first.
 */
export function Chapter({
  id,
  index,
  km,
  place,
  pin = true,
  wide = false,
  className = "",
  children,
}: {
  id: string;
  index: number;
  km: number;
  place: string;
  pin?: boolean;
  wide?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const active = useMoment((m) => m.chapter === index, false);
  const seen = useMoment((m) => m.chapter >= index, false);
  const panel = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!seen) return;
    const head = panel.current?.querySelector<HTMLElement>(".mr-h2");
    if (!head || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const split = SplitText.create(head, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, { yPercent: 105, duration: 1.15, ease: "expo.out", stagger: 0.09 });
      },
    });
    return () => split.revert();
  }, [seen]);

  return (
    <section
      id={id}
      className={`mr-chapter ${className}`.trim()}
      data-pin={pin}
      data-active={active}
      data-seen={seen}
      aria-labelledby={`${id}-title`}
    >
      <div className="mr-mile" aria-hidden>
        <span className="mr-mile-post">
          <b className="mr-num">{num(Math.round(km))}</b>
          <i>км</i>
        </span>
        <span className="mr-mile-place">{place}</span>
      </div>
      <div className="mr-stick">
        <div ref={panel} className="mr-panel" data-wide={wide}>
          {children}
        </div>
      </div>
    </section>
  );
}
