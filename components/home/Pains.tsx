"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { scrollToSection } from "@/components/motion/SmoothScroll";
import { TypeText } from "@/components/motion/TypeText";
import { Section } from "@/components/ui/Section";
import { cssColor } from "@/lib/cssColor";
import { remeasureSections } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The situations people arrive with, told as a story you scroll through.
 *
 * The sheet stops, and the scroll takes over the pen: each situation types
 * itself out as you move, the words that hurt are marked in cobalt, and
 * what it quietly costs rises in underneath. Then it clears for the next.
 * Stop scrolling and the story stops with you.
 *
 * Without motion (or before GSAP runs) all four are simply printed in a
 * column, so nothing depends on the animation to be read.
 */
export function Pains() {
  const copy = useCopy();
  const pains = copy.pains;
  const pinRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = pinRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const stage = root.querySelector<HTMLElement>("[data-stage]");
        const items = gsap.utils.toArray<HTMLElement>("[data-pain]", root);
        const bars = gsap.utils.toArray<HTMLElement>("[data-bar]", root);
        const closing = root.querySelector<HTMLElement>("[data-closing]");
        if (!stage || items.length === 0) return;

        const ink = cssColor("--color-ink", "#121211");
        const cobalt = cssColor("--color-cobalt", "#1b2ed8");

        root.dataset.story = "on";
        gsap.set(items, { autoAlpha: 0 });
        gsap.set(bars, { scaleX: 0 });
        if (closing) gsap.set(closing, { autoAlpha: 0, y: 24 });

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${window.innerHeight * items.length * 1.15}`,
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        items.forEach((item, i) => {
          const chars = item.querySelectorAll<HTMLElement>("[data-ch]");
          const mark = item.querySelector<HTMLElement>("[data-mark]");
          const words = item.querySelectorAll<HTMLElement>("[data-cost]");
          gsap.set(chars, { opacity: 0 });
          gsap.set(words, { yPercent: 115 });
          if (mark) gsap.set(mark, { backgroundSize: "0% 0.78em", color: ink });

          const label = `pain-${i}`;
          timeline.addLabel(label);
          if (i > 0) {
            timeline
              .to(items[i - 1]!, { autoAlpha: 0, y: -40, duration: 0.5, ease: "power2.in" }, label)
              .to(bars[i - 1]!, { backgroundColor: ink, duration: 0.2 }, label);
          }
          timeline
            .fromTo(item, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" })
            .to(bars[i]!, { scaleX: 1, duration: 3.2 }, "<")
            .to(chars, { opacity: 1, duration: chars.length * 0.035, stagger: 0.035 }, "<")
            .to(mark, { backgroundSize: "100% 0.78em", color: cobalt, duration: 0.7, ease: "power2.inOut" })
            .to(words, { yPercent: 0, duration: 0.9, stagger: 0.025, ease: "power3.out" })
            .to({}, { duration: 0.9 });
        });

        if (closing) timeline.to(closing, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" });

        ScrollTrigger.addEventListener("refresh", remeasureSections);
        return () => {
          delete root.dataset.story;
          ScrollTrigger.removeEventListener("refresh", remeasureSections);
        };
      });

      return () => mm.revert();
    },
    { scope: pinRef, dependencies: [pains], revertOnUpdate: true },
  );

  return (
    <Section id="pains" flush>
      <div
        ref={pinRef}
        className="group/story sheet flex min-h-[100svh] flex-col py-20 data-[story=on]:h-[100svh] lg:py-24"
      >
        <div className="sheet-grid flex-1 gap-y-10 border-t border-ink pt-8 lg:pt-10">
          <div className="col-span-12 flex flex-col lg:col-span-4">
            <TypeText
              as="h2"
              lines={[pains.title]}
              className="poster text-[clamp(3.8rem,8.5vw,9.5rem)] text-ink"
            />
            <p className="mt-5 max-w-[34ch] text-copy text-ink-soft">{pains.lede}</p>

            <ol aria-hidden className="mt-10 hidden gap-2 group-data-[story=on]/story:flex lg:mt-auto">
              {pains.items.map((item) => (
                <li key={item.key} className="h-[3px] flex-1 bg-rule">
                  <span data-bar className="block h-full origin-left bg-cobalt" />
                </li>
              ))}
            </ol>
          </div>

          <div
            data-stage
            className="relative col-span-12 flex flex-col gap-14 group-data-[story=on]/story:block lg:col-span-8"
          >
            {pains.items.map((item) => {
              const at = item.pain.indexOf(item.mark);
              const before = at >= 0 ? item.pain.slice(0, at) : item.pain;
              const mark = at >= 0 ? item.mark : "";
              const after = at >= 0 ? item.pain.slice(at + item.mark.length) : "";
              return (
                <article
                  key={item.key}
                  data-pain
                  className="group-data-[story=on]/story:absolute group-data-[story=on]/story:inset-x-0 group-data-[story=on]/story:top-1/2 group-data-[story=on]/story:-translate-y-1/2"
                >
                  <p className="text-[clamp(2.1rem,4.6vw,5.2rem)] leading-[1.06] font-bold tracking-[-0.03em] text-ink">
                    <Letters text={before} />
                    {mark && (
                      <span
                        data-mark
                        className="[box-decoration-break:clone] bg-[linear-gradient(var(--color-cobalt-pale),var(--color-cobalt-pale))] bg-[length:100%_0.78em] bg-[position:0_85%] bg-no-repeat text-cobalt [-webkit-box-decoration-break:clone]"
                      >
                        <Letters text={mark} />
                      </span>
                    )}
                    <Letters text={after} />
                  </p>
                  <p className="mt-8 max-w-[44ch] text-[clamp(1.15rem,1.5vw,1.45rem)] leading-[1.4] text-ink-soft lg:mt-10">
                    {item.cost.split(" ").map((word, i) => (
                      <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-bottom">
                        <span data-cost className="inline-block">
                          {word}&nbsp;
                        </span>
                      </span>
                    ))}
                  </p>
                </article>
              );
            })}

            <a
              data-closing
              href="#services"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("services");
              }}
              className="group relative mt-4 inline-flex items-center gap-4 font-[family-name:var(--font-hand)] text-[clamp(1.8rem,2.6vw,2.6rem)] leading-none font-semibold text-cobalt group-data-[story=on]/story:absolute group-data-[story=on]/story:bottom-0 group-data-[story=on]/story:left-0"
            >
              {pains.closing}
              <svg aria-hidden viewBox="0 0 40 40" className="h-9 w-9 overflow-visible transition-transform duration-500 group-hover:translate-y-1">
                <path d="M8 6 C 14 20, 22 28, 32 32 M22 34 32 32 30 22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Letters({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\s+)/).map((part, i) =>
        /^\s+$/.test(part) ? (
          <span key={i} data-ch>
            {" "}
          </span>
        ) : (
          <span key={i} className="inline-block whitespace-nowrap">
            {Array.from(part).map((char, ci) => (
              <span key={ci} data-ch>
                {char}
              </span>
            ))}
          </span>
        ),
      )}
    </>
  );
}
