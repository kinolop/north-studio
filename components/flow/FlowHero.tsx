"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { CaseBar } from "@/components/cases/CaseBar";
import { useChannelOverlay } from "@/components/contact/ChannelOverlayProvider";
import { InkButton } from "@/components/home/InkButton";
import { useCopy } from "@/components/i18n/CopyProvider";
import { PrintLines } from "@/components/motion/PrintLines";
import { TypeText } from "@/components/motion/TypeText";
import { Section } from "@/components/ui/Section";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Same numbers on the server and in the browser, so the pile never jumps. */
function seeded(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

interface Geometry {
  w: number;
  h: number;
  cw: number;
  ch: number;
  lineY: number;
  stations: number[];
  boardTop: number;
  colW: number;
  headerH: number;
  filedScale: number;
  narrow: boolean;
}

function measure(w: number, h: number): Geometry {
  const narrow = w < 720;
  const cw = narrow ? Math.min(128, w * 0.36) : Math.min(200, Math.max(142, w * 0.128));
  const ch = cw * 0.66;
  const lineY = Math.max(ch * 0.9, h * (narrow ? 0.2 : 0.22));
  const colW = w / 4;
  return {
    w,
    h,
    cw,
    ch,
    lineY,
    stations: [0.12, 0.37, 0.62, 0.87].map((f) => f * w),
    boardTop: h * (narrow ? 0.44 : 0.47),
    colW,
    headerH: narrow ? 30 : 38,
    filedScale: Math.min(0.84, (colW - 12) / cw),
    narrow,
  };
}

/**
 * The first screen of North Flow: a desk buried in enquiries, and the line
 * that clears it.
 *
 * Ten enquiries from six channels lie scattered where they landed. The
 * scroll runs the line: a cobalt rail draws across the page, and one by one
 * each card is lifted out of the pile, straightened onto the rail and
 * carried through the four stations. At the tagging station it is stamped
 * warm or for nurture, at the manager's it is written a name by hand, at
 * the CRM it is ticked, and then it drops into its manager's column. By the
 * last card the pile is gone and the board is in order.
 *
 * All of it is one GSAP timeline scrubbed by a pinned scroll, so it runs
 * backwards as honestly as forwards. Positions are measured from the stage,
 * not guessed, and rebuilt when the window changes size.
 */
export function FlowHero() {
  const copy = useCopy();
  const flow = copy.flowCase;
  const hero = flow.hero;
  const { open } = useChannelOverlay();
  const reduced = useReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);

  // Who each card goes to: warm enquiries share out between the managers in
  // turn, everything for nurture goes to the last column.
  const routes = useMemo(() => {
    let turn = 0;
    return hero.leads.map((lead) => {
      if (lead.tone === "cold") return 3;
      const column = turn % flow.managers.length;
      turn += 1;
      return column;
    });
  }, [hero.leads, flow.managers.length]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => {
      const rect = stage.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      setGeo((previous) =>
        previous &&
        Math.abs(previous.w - rect.width) < 2 &&
        Math.abs(previous.h - rect.height) < 2
          ? previous
          : measure(rect.width, rect.height),
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;
      const stage = stageRef.current;
      if (!root || !stage || !geo) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", stage);
      const line = stage.querySelector<HTMLElement>("[data-line]");
      const stations = gsap.utils.toArray<HTMLElement>("[data-station]", stage);
      const rings = gsap.utils.toArray<HTMLElement>("[data-ring]", stage);
      const columns = gsap.utils.toArray<HTMLElement>("[data-column]", stage);
      const chaosNote = stage.querySelector<HTMLElement>("[data-chaos]");
      const orderNote = stage.querySelector<HTMLElement>("[data-order]");
      const stationLabels = gsap.utils.toArray<HTMLElement>("[data-station-label]", stage);
      const { cw, ch, lineY, colW, boardTop, headerH, filedScale } = geo;

      const slotsTaken = [0, 0, 0, 0];
      const step = ch * filedScale * (geo.narrow ? 0.34 : 0.4);

      cards.forEach((card, i) => {
        gsap.set(card, {
          x: seeded(i + 1) * (geo.w - cw),
          y: geo.h * 0.04 + seeded(i + 11) * (geo.h * 0.92 - ch),
          rotation: (seeded(i + 21) - 0.5) * 54,
          scale: 1,
          zIndex: 10 + i,
        });
        gsap.set(card.querySelectorAll("[data-tone],[data-tick]"), { opacity: 0, scale: 1.8 });
        gsap.set(card.querySelector("[data-route]"), { clipPath: "inset(0 100% 0 0)" });
      });
      if (line) gsap.set(line, { scaleX: 0 });
      gsap.set(stations, { scale: 0 });
      gsap.set(stationLabels, { opacity: 0, y: 8 });
      gsap.set(rings, { scale: 0.6, opacity: 0 });
      gsap.set(columns, { opacity: 0, y: 14 });
      if (orderNote) gsap.set(orderNote, { opacity: 0, y: 10 });

      const filedAt: number[] = [];
      // Counted from the timeline itself, so the figure follows the scrub
      // smoothing rather than the raw scroll position.
      const count = () => {
        const done = filedAt.filter((t) => timeline.time() >= t).length;
        if (counterRef.current) counterRef.current.textContent = String(done).padStart(2, "0");
      };
      const timeline = gsap.timeline({ defaults: { ease: "power2.inOut" }, onUpdate: count });
      timeline
        .to(line, { scaleX: 1, duration: 0.55, ease: "power2.out" }, 0)
        .to(stations, { scale: 1, duration: 0.3, stagger: 0.08, ease: "back.out(2.4)" }, 0.18)
        .to(stationLabels, { opacity: 1, y: 0, duration: 0.3, stagger: 0.08, ease: "power2.out" }, 0.24)
        .to(columns, { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, ease: "power2.out" }, 0.32)
        .to(chaosNote, { opacity: 0, y: -10, duration: 0.3 }, 1.1);

      const pulse = (station: number, at: number) => {
        const ring = rings[station];
        if (!ring) return;
        timeline.fromTo(
          ring,
          { scale: 0.6, opacity: 0.8 },
          { scale: 2.6, opacity: 0, duration: 0.35, ease: "power1.out", immediateRender: false },
          at,
        );
      };
      const atStation = (k: number) => (geo.stations[k] ?? 0) - cw / 2;

      cards.forEach((card, i) => {
        const start = 0.6 + i * 0.42;
        const column = routes[i] ?? 0;
        const k = slotsTaken[column]!;
        slotsTaken[column] = k + 1;
        const slot = {
          x: column * colW + colW / 2 - cw / 2,
          y: boardTop + headerH + k * step - ch / 2 + (ch * filedScale) / 2,
          rotation: (seeded(i + 31) - 0.5) * 5,
        };
        const tone = card.querySelector("[data-tone]");
        const route = card.querySelector("[data-route]");
        const tick = card.querySelector("[data-tick]");

        timeline
          .set(card, { zIndex: 100 + i }, start)
          .to(card, { x: atStation(0), y: lineY - ch / 2, rotation: 0, duration: 0.45 }, start);
        pulse(0, start + 0.45);
        timeline.to(card, { x: atStation(1), duration: 0.35, ease: "power1.inOut" }, start + 0.5);
        pulse(1, start + 0.85);
        timeline
          .to(tone, { opacity: 1, scale: 1, duration: 0.12, ease: "power3.out" }, start + 0.85)
          .to(card, { x: atStation(2), duration: 0.35, ease: "power1.inOut" }, start + 0.97);
        pulse(2, start + 1.32);
        timeline
          .to(route, { clipPath: "inset(0 0% 0 0)", duration: 0.16, ease: "none" }, start + 1.32)
          .to(card, { x: atStation(3), duration: 0.35, ease: "power1.inOut" }, start + 1.48);
        pulse(3, start + 1.83);
        timeline
          .to(tick, { opacity: 1, scale: 1, duration: 0.12, ease: "back.out(3)" }, start + 1.83)
          .to(
            card,
            { ...slot, scale: filedScale, zIndex: 20 + k, duration: 0.5, ease: "power3.inOut" },
            start + 1.98,
          );
        // Counted as it settles into the column, not on the last pixel of the drop.
        filedAt.push(start + 2.26);
      });

      const end = (filedAt[filedAt.length - 1] ?? 1) + 0.32;
      timeline.to(orderNote, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, end);
      timeline.to({}, { duration: 0.5 });

      if (reduced) {
        timeline.progress(1);
        count();
        return;
      }

      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: () => `+=${window.innerHeight * 3.2}`,
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        animation: timeline,
      });
    },
    { scope: rootRef, dependencies: [geo, reduced, routes], revertOnUpdate: true },
  );

  const managerName = (column: number) =>
    column === 3 ? flow.nurture : (flow.managers[column] ?? flow.nurture);
  const columns = [...flow.managers, flow.nurture];

  return (
    <Section id="flow-hero" flush>
      <div
        ref={rootRef}
        className="flex h-[100svh] min-h-[620px] flex-col overflow-hidden bg-paper pt-20 lg:pt-24"
      >
        <div className="sheet">
          <CaseBar back={flow.backToWork} product={flow.productName} tag={flow.demoTag} />
          <div className="sheet-grid mt-6 items-end gap-y-4 lg:mt-8">
            <TypeText
              as="h1"
              trigger="manual"
              lines={hero.title}
              speed={52}
              className="poster col-span-12 text-[clamp(2.8rem,7.4vw,8rem)] text-ink lg:col-span-7"
            />
            <div className="col-span-12 flex flex-col gap-5 lg:col-span-5 lg:items-start">
              <PrintLines
                text={hero.lede}
                start="top bottom"
                delay={0.9}
                className="hidden max-w-[46ch] text-copy text-ink-soft sm:block"
              />
              <div className="flex items-center gap-6">
                <InkButton size="sm" onClick={() => open()}>
                  {hero.cta}
                </InkButton>
                <p className="mark text-ink">
                  <span className="text-ink-mute">{hero.filedLabel}: </span>
                  <span ref={counterRef} className="text-cobalt">
                    00
                  </span>
                  <span className="text-ink-mute">
                    {" "}
                    / {String(hero.leads.length).padStart(2, "0")}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={stageRef}
          aria-hidden
          className="relative mx-[var(--spacing-page)] mt-4 mb-6 min-h-[320px] flex-1 transition-opacity duration-500 lg:mt-6"
          style={{ opacity: geo ? 1 : 0 }}
        >
          {geo && (
            <>
              <span className="absolute right-0 left-0 h-px bg-rule" style={{ top: geo.lineY }} />
              <span
                data-line
                className="absolute right-0 left-0 h-[3px] origin-left bg-cobalt"
                style={{ top: geo.lineY - 1 }}
              />
              {geo.stations.map((x, k) => (
                <span key={k} className="absolute" style={{ left: x, top: geo.lineY }}>
                  <span
                    data-ring
                    className="absolute -top-3 -left-3 block h-6 w-6 rounded-full border-2 border-cobalt"
                  />
                  <span
                    data-station
                    className="absolute -top-2 -left-2 block h-4 w-4 rounded-full border-[3px] border-cobalt bg-paper"
                  />
                  <span
                    data-station-label
                    className="mark absolute -translate-x-1/2 whitespace-nowrap text-ink max-sm:text-[0.6rem] max-sm:tracking-[0.02em]"
                    style={{ top: -geo.ch / 2 - 26 }}
                  >
                    {flow.stations[k]}
                  </span>
                </span>
              ))}

              {columns.map((name, column) => (
                <span
                  key={name}
                  data-column
                  className="absolute border-t-2 border-ink pt-2"
                  style={{ left: column * geo.colW + 6, width: geo.colW - 12, top: geo.boardTop }}
                >
                  <span
                    className={`block text-small font-bold ${column === 3 ? "text-ink-mute" : "text-ink"}`}
                  >
                    {name}
                  </span>
                </span>
              ))}

              <span
                data-chaos
                className="pointer-events-none absolute z-[300] flex items-end gap-2 font-[family-name:var(--font-hand)] leading-none font-semibold text-cobalt"
                style={{
                  right: 0,
                  top: 0,
                  fontSize: geo.narrow ? 22 : 34,
                  transform: "rotate(-4deg)",
                }}
              >
                <svg viewBox="0 0 40 40" className="h-8 w-8 overflow-visible">
                  <path
                    d="M34 6 C 24 10, 14 20, 8 32 M6 22 8 32 18 30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {hero.chaosNote}
              </span>

              <span
                data-order
                className="pointer-events-none absolute z-[300] font-[family-name:var(--font-hand)] leading-none font-semibold text-cobalt"
                style={{
                  right: 4,
                  top: geo.boardTop - (geo.narrow ? 30 : 44),
                  fontSize: geo.narrow ? 22 : 32,
                  transform: "rotate(-3deg)",
                }}
              >
                {hero.orderNote}
              </span>

              {hero.leads.map((lead, i) => (
                <div
                  key={lead.key}
                  data-card
                  className="absolute top-0 left-0 flex flex-col justify-between rounded-[3px] border border-rule bg-[#f8f7f3] shadow-[0_16px_34px_-22px_rgb(18_18_17/0.6)] will-change-transform"
                  style={{
                    width: geo.cw,
                    height: geo.ch,
                    padding: geo.cw * 0.065,
                    fontSize: geo.cw * 0.07,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-[family-name:var(--font-mark)] text-[0.78em] tracking-[0.02em] text-ink-mute uppercase">
                      {flow.channels[lead.channel]}
                    </span>
                    <svg data-tick viewBox="0 0 20 20" className="h-[1.3em] w-[1.3em] overflow-visible">
                      <circle cx="10" cy="10" r="9" fill="none" stroke="var(--color-cobalt)" strokeWidth="2" />
                      <path
                        d="M5.5 10.5 8.6 13.4 14.5 7"
                        fill="none"
                        stroke="var(--color-cobalt)"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="line-clamp-2 leading-[1.2] font-semibold text-ink">{lead.text}</p>
                  <div className="flex items-end justify-between gap-2">
                    <span
                      data-tone
                      className={`-rotate-3 border-[1.5px] px-[0.35em] py-[0.05em] font-[family-name:var(--font-mark)] text-[0.72em] uppercase ${lead.tone === "warm" ? "border-cobalt text-cobalt" : "border-ink-mute text-ink-mute"}`}
                    >
                      {flow.tones[lead.tone]}
                    </span>
                    <span
                      data-route
                      className="font-[family-name:var(--font-hand)] text-[1.25em] leading-none font-semibold whitespace-nowrap text-cobalt"
                    >
                      {managerName(routes[i] ?? 0)}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </Section>
  );
}
