"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { NOCTURA } from "@/lib/noctura";

import { NocturaReveal } from "./NocturaReveal";

const ROOMS = NOCTURA.rooms.items;

/** How long the words hold out before the new ones fade in. */
const SWAP_MS = 260;

/**
 * The lift - the rooms section, and the one place this page spends its
 * boldness.
 *
 * The obvious build for "three room categories" is a horizontal carousel,
 * and it would have been wrong here. NOCTURA is a forty-two floor tower and
 * the categories genuinely live at different heights: the Deluxe on 12, the
 * panoramic suite on 27, the penthouse holding all of 40. So choosing a
 * category does what choosing a floor does in the building - it moves the
 * car. A stacked column of floors travels vertically on the heaviest curve
 * in the system, the pictures counter-travel against it so the motion reads
 * as depth rather than as a slideshow, the brass indicator slides, and the
 * floor readout in the corner catches up.
 *
 * The choreography is deliberately not simultaneous. The car leaves at
 * once; the words wait 260ms, then fade out and back. Everything arriving
 * together would feel like a tab switch, and the point is that something
 * heavy is moving.
 */
export function NocturaRooms() {
  const copy = NOCTURA.rooms;

  /** Where the car is going. Drives the travel immediately. */
  const [active, setActive] = useState(0);
  /** Whose words are on screen. Trails `active` by one swap. */
  const [shown, setShown] = useState(0);
  const [swapping, setSwapping] = useState(false);

  const timers = useRef<number[]>([]);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const select = useCallback(
    (index: number) => {
      if (index === active) return;
      setActive(index);

      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];

      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setShown(index);
        return;
      }

      setSwapping(true);
      timers.current.push(
        window.setTimeout(() => {
          setShown(index);
          setSwapping(false);
        }, SWAP_MS),
      );
    },
    [active],
  );

  /** Arrow keys walk the floors, the way a tablist is expected to. */
  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = ROOMS.length - 1;
    let next: number | null = null;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      next = active === last ? 0 : active + 1;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      next = active === 0 ? last : active - 1;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = last;
    }

    if (next === null) return;
    event.preventDefault();
    select(next);
    tabsRef.current[next]?.focus();
  };

  const room = ROOMS[shown] ?? ROOMS[0];
  const travelling = ROOMS[active] ?? ROOMS[0];

  return (
    <section id="rooms" className="n-section">
      <div
        className="n-warm"
        aria-hidden
        style={
          {
            "--n-warm-x": "78%",
            "--n-warm-y": "36%",
            "--n-warm-strength": "0.07",
          } as React.CSSProperties
        }
      />

      <div className="n-wrap n-rel">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <NocturaReveal>
              <p className="n-label">{copy.eyebrow}</p>
            </NocturaReveal>
            <NocturaReveal delay={90} distance={30}>
              <h2 className="n-h2 mt-7">
                {copy.title.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            </NocturaReveal>
          </div>

          <NocturaReveal delay={180} className="lg:col-span-5">
            <p className="n-lead max-w-[44ch]">{copy.lede}</p>
          </NocturaReveal>
        </div>

        <NocturaReveal delay={120} distance={34}>
          <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-x-16">
            {/* ---- The shaft ------------------------------------------- */}
            <div className="lg:col-span-7">
              <div
                className="n-shaft"
                style={{ "--n-floor": active } as React.CSSProperties}
              >
                <div className="n-car">
                  {ROOMS.map((item, index) => (
                    <div
                      key={item.key}
                      className="n-floor"
                      style={{ "--i": index } as React.CSSProperties}
                    >
                      <div className="n-floor-inner">
                        <Image
                          src={item.image}
                          alt={`${item.name} - ${item.kicker}, этаж ${item.floor}`}
                          fill
                          sizes="(max-width: 1023px) 135vw, 80vw"
                          // Eager rather than lazy: two of the three sit
                          // outside the clip at rest, and a floor that has
                          // not loaded yet would arrive as an empty frame
                          // at the end of a one-second travel.
                          loading="eager"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Brass indicator down the side of the shaft. */}
                <div className="n-indicator" aria-hidden>
                  <span className="n-indicator-dot" />
                </div>

                {/* The car's floor readout, top right, the way it is above
                    the doors. Re-keyed so the number fades rather than
                    swapping under you. */}
                <div
                  aria-hidden
                  className="absolute z-[4] flex flex-col items-end"
                  style={{
                    top: "clamp(1rem, 2.4vw, 1.8rem)",
                    right: "clamp(1rem, 2.4vw, 1.8rem)",
                  }}
                >
                  <span
                    className="n-label"
                    style={{ fontSize: "0.5625rem", letterSpacing: "0.3em" }}
                  >
                    {copy.floorLabel}
                  </span>
                  <span
                    key={travelling.floor}
                    style={{
                      fontFamily: "var(--font-cormorant), serif",
                      fontSize: "clamp(2.4rem, 4.6vw, 3.6rem)",
                      lineHeight: 1,
                      color: "var(--n-champagne)",
                      fontVariantNumeric: "tabular-nums",
                      marginTop: "0.35rem",
                      textShadow: "0 2px 30px rgb(0 0 0 / 0.8)",
                      animation: "n-readout 720ms var(--n-ease) both",
                    }}
                  >
                    {travelling.floor}
                  </span>
                </div>

                {/* Keeps the readout legible over a bright ceiling. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-[2]"
                  style={{
                    background:
                      "linear-gradient(to bottom left, rgb(8 7 9 / 0.6), transparent 42%)",
                  }}
                />
              </div>
            </div>

            {/* ---- The floors, and what is on the one you chose --------- */}
            <div className="lg:col-span-5">
              <div
                role="tablist"
                aria-label={copy.selectorLabel}
                aria-orientation="vertical"
                onKeyDown={onKeyDown}
              >
                {ROOMS.map((item, index) => (
                  <button
                    key={item.key}
                    ref={(node) => {
                      tabsRef.current[index] = node;
                    }}
                    type="button"
                    role="tab"
                    id={`n-tab-${item.key}`}
                    aria-selected={index === active}
                    aria-controls="n-room-panel"
                    tabIndex={index === active ? 0 : -1}
                    className="n-pick"
                    onClick={() => select(index)}
                  >
                    <span className="flex items-baseline gap-3">
                      <span
                        className="n-label"
                        style={{
                          fontSize: "0.5625rem",
                          color:
                            index === active
                              ? "var(--n-gold)"
                              : "var(--n-ash)",
                          transition: "color 380ms var(--n-ease)",
                        }}
                      >
                        {item.floor}
                      </span>
                      <span className="n-pick-name">{item.name}</span>
                    </span>
                    <span
                      className="n-small mt-1 block"
                      style={{ color: "inherit", opacity: 0.66 }}
                    >
                      {item.kicker}
                    </span>
                  </button>
                ))}
                {/* Closes the last button's rule so the stack reads as a
                    ruled list rather than three floating rows. */}
                <div
                  aria-hidden
                  style={{ height: "1px", backgroundColor: "var(--n-line)" }}
                />
              </div>

              <div
                id="n-room-panel"
                role="tabpanel"
                aria-labelledby={`n-tab-${room.key}`}
                className="n-detail mt-12"
                data-state={swapping ? "out" : "in"}
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="n-label n-label-dim">
                    {copy.priceLabel}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-cormorant), serif",
                      fontSize: "clamp(1.9rem, 2.8vw, 2.5rem)",
                      lineHeight: 1,
                      color: "var(--n-gold)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {room.price}
                  </span>
                  <span className="n-small">{copy.priceUnit}</span>
                </div>

                <p className="n-body mt-7">{room.body}</p>

                <dl className="mt-10 grid gap-6 sm:grid-cols-2">
                  {room.features.map((feature) => (
                    <div key={feature.label} className="n-spec">
                      <dt className="n-label n-label-dim">{feature.label}</dt>
                      <dd
                        className="n-small"
                        style={{ color: "var(--n-ivory)", margin: 0 }}
                      >
                        {feature.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <a href="#booking" className="n-btn n-btn-gold">
                    {copy.cta}
                  </a>
                  <p className="n-small" style={{ maxWidth: "26ch" }}>
                    {copy.priceNote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </NocturaReveal>
      </div>

      <style>{`
        @keyframes n-readout {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes n-readout {
            from { opacity: 1; transform: none; }
            to   { opacity: 1; transform: none; }
          }
        }
      `}</style>
    </section>
  );
}
