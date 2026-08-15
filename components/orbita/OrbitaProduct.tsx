"use client";

import { useEffect, useRef, useState } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { AssetSlot } from "@/components/ui/AssetSlot";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { orbitaSectionById } from "@/lib/sections";
import { useReducedMotion } from "@/lib/useReducedMotion";

import { OrbitaScreenPlate } from "./OrbitaMock";

const meta = orbitaSectionById("orbita-product");
const ASSETS = "/work/orbita/assets";

/** Image file per feature, in the order the dictionary lists them. */
const SHOT: Record<string, string> = {
  accounts: "shot-1.jpg",
  transfer: "shot-2.jpg",
  insight: "shot-3.jpg",
};

/**
 * The showcase: one screen held still while the argument scrolls past it.
 *
 * A sticky column rather than a GSAP pin. The home page already spends its
 * pin budget on Process, and a pin changes document height — which means
 * telling the scroll store to remeasure, and one more thing that can drift.
 * `position: sticky` costs none of that, and an IntersectionObserver
 * watching a thin band across the middle of the viewport decides which
 * screen is showing. All three are in the DOM at all times; only opacity
 * moves.
 *
 * Below the breakpoint, and whenever motion is unwanted, it collapses to
 * the obvious thing: each screen sitting above the words about it.
 */
export function OrbitaProduct() {
  const copy = useCopy();
  const reduced = useReducedMotion();
  const product = copy.orbitaCase.product;

  const [active, setActive] = useState(0);
  const itemsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (reduced) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (!Number.isNaN(index)) setActive(index);
        }
      },
      // A 10% band across the middle of the viewport: whichever block is
      // crossing the reader's eyeline is the one on the screen beside it.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    for (const element of itemsRef.current) {
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <Section id={meta.id}>
      <div className="container-north">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
            <SplitLines
              as="h2"
              lines={product.title}
              className="mt-8 font-display text-[clamp(1.8rem,3.4vw,3.2rem)] leading-[1] font-semibold tracking-[-0.035em] text-bone [font-variation-settings:'wdth'_92]"
            />
          </div>
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.08}>
            <p className="max-w-[38ch] text-body text-ash">{product.lede}</p>
          </Reveal>
        </div>

        <div className="mt-20 grid gap-14 lg:grid-cols-12 lg:gap-12">
          {/* The held screen. Only on wide viewports, and only when motion
              is welcome — otherwise every feature carries its own. */}
          {!reduced && (
            <div className="hidden lg:col-span-5 lg:block">
              <div className="sticky top-[18vh]">
                <div className="relative">
                  {product.items.map((item, index) => (
                    <div
                      key={item.key}
                      aria-hidden={index !== active}
                      className={`transition-opacity duration-[620ms] ease-[var(--ease-north)] ${
                        index === 0 ? "" : "absolute inset-0"
                      } ${index === active ? "opacity-100" : "opacity-0"}`}
                    >
                      <AssetSlot
                        src={`${ASSETS}/${SHOT[item.key]}`}
                        label={item.slotLabel}
                        alt={item.name}
                        ratio="4 / 5"
                        fallback={<OrbitaScreenPlate variant={item.key} />}
                        className="border-orbita/20"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <ol
            className={`space-y-20 lg:space-y-0 ${reduced ? "lg:col-span-12 lg:grid lg:grid-cols-3 lg:gap-10 lg:space-y-0" : "lg:col-span-6 lg:col-start-7"}`}
          >
            {product.items.map((item, index) => (
              <li
                key={item.key}
                data-index={index}
                ref={(element) => {
                  itemsRef.current[index] = element;
                }}
                className={reduced ? "" : "lg:flex lg:min-h-[74vh] lg:flex-col lg:justify-center"}
              >
                {/* The narrow-screen (and reduced-motion) copy of the same
                    frame. One component, two compositions. */}
                <div className={reduced ? "mb-10" : "mb-10 lg:hidden"}>
                  <AssetSlot
                    src={`${ASSETS}/${SHOT[item.key]}`}
                    label={item.slotLabel}
                    alt={item.name}
                    ratio="4 / 5"
                    fallback={<OrbitaScreenPlate variant={item.key} />}
                    className="mx-auto max-w-[26rem] border-orbita/20"
                  />
                </div>

                <Reveal>
                  <p className="label-mono text-orbita">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-6 max-w-[20ch] font-display text-[clamp(1.4rem,2.2vw,2rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-bone [font-variation-settings:'wdth'_92]">
                    {item.name}
                  </h3>
                  <p className="mt-6 max-w-[46ch] text-body text-ash">{item.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
