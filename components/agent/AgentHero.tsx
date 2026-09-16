"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { CaseBar } from "@/components/cases/CaseBar";
import { useChannelOverlay } from "@/components/contact/ChannelOverlayProvider";
import { InkButton } from "@/components/home/InkButton";
import { useCopy } from "@/components/i18n/CopyProvider";
import { PrintLines } from "@/components/motion/PrintLines";
import { scrollToSection } from "@/components/motion/SmoothScroll";
import { TypeText } from "@/components/motion/TypeText";
import { Section } from "@/components/ui/Section";
import { useOnScreen } from "@/lib/useOnScreen";
import { useReducedMotion } from "@/lib/useReducedMotion";

const VIDEO = "/work/north-agent/assets/hero.mp4";
const POSTER = "/work/north-agent/assets/hero-poster.jpg";

/** The camera's push-in is slowed so the seam comes round less often. */
const RATE = 0.72;
/** How far the take has pushed in by its last frame, measured on the mascot. */
const PUSH_IN = 1.3;
/** The mascot's centre in the frame, which the push-in closes on. */
const ORIGIN = "50% 46%";
/** Seconds for the next take to cover the last one. */
const TAKEOVER = 0.5;
/** Seconds for the next take to ease back out to its opening framing. */
const PULL_BACK = 1.8;

/**
 * The agent's first screen: the film of the mascot on paper, with the
 * promise typed on the left.
 *
 * The film is framed rather than simply covered. It is scaled so the mascot
 * stands in the right half on wide screens and in the upper half on phones,
 * which also puts the corner the generator signed outside the page. The
 * left edge and the foot of the picture fade into the site's paper, so the
 * type sits on the same sheet the character floats over. Visitors who asked
 * for less motion get the still, framed the same way.
 */
export function AgentHero() {
  const copy = useCopy();
  const agent = copy.agentCase;
  const { open } = useChannelOverlay();
  const reduced = useReducedMotion();

  return (
    <Section id="agent-hero" flush className="relative min-h-[100svh] overflow-hidden bg-paper">
      <div
        aria-hidden
        className="absolute top-0 left-1/2 aspect-video w-[250%] -translate-x-1/2 md:w-[170%] lg:top-[56%] lg:left-[64%] lg:w-[max(128%,205svh)] lg:-translate-y-1/2"
      >
        {reduced ? (
          <Image src={POSTER} alt="" fill priority sizes="200vw" className="object-cover" />
        ) : (
          <LoopFilm src={VIDEO} poster={POSTER} />
        )}
      </div>

      {/* The picture's paper fades into the page's: behind the type, and at the foot into the next section. */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 hidden w-[62%] bg-[linear-gradient(to_right,rgb(236_235_230/0.8),rgb(236_235_230/0.45)_45%,transparent)] lg:block"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[58%] bg-[linear-gradient(to_top,var(--color-paper)_48%,rgb(236_235_230/0.9)_72%,transparent)] lg:h-40 lg:bg-[linear-gradient(to_top,var(--color-paper),transparent)]"
      />

      <div className="sheet relative flex min-h-[100svh] flex-col pt-20 pb-10 lg:pt-24 lg:pb-14">
        <CaseBar back={agent.backToWork} product={agent.productName} tag={agent.demoTag} />

        <div className="mt-auto max-w-[44rem] lg:my-auto lg:max-w-[46%]">
          <p className="mark text-cobalt">{agent.productName}</p>
          <TypeText
            as="h1"
            trigger="manual"
            lines={agent.hero.title}
            speed={50}
            className="poster mt-4 text-[clamp(3rem,6.6vw,7.6rem)] text-ink"
          />
          <PrintLines
            text={agent.hero.lede}
            start="top bottom"
            delay={1.3}
            className="mt-6 max-w-[42ch] text-[clamp(1.15rem,1.5vw,1.4rem)] leading-[1.35] text-ink"
          />
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <InkButton onClick={() => open()}>{agent.hero.cta}</InkButton>
            <a
              href="#agent-chat"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("agent-chat");
              }}
              className="ink-link text-small font-semibold text-ink"
            >
              {agent.hero.secondary}
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}

/**
 * The film, looped without a cut.
 *
 * The take is a slow push-in, so its last frame is closer than its first and
 * a plain `loop` would jump back every few seconds. Two copies play in turn
 * instead. Shortly before one ends, the other starts from the top already
 * enlarged to the same closeness, covers it in half a second, and then eases
 * back out to its own opening framing: the camera seems to breathe in and
 * out rather than cut. While the hero is off screen both hold still.
 */
function LoopFilm({ src, poster }: { src: string; poster: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLVideoElement>(null);
  const secondRef = useRef<HTMLVideoElement>(null);
  /** Which take is showing; kept across pauses so a return resumes it. */
  const current = useRef(0);
  const onScreen = useOnScreen(rootRef, "0px");

  useEffect(() => {
    const first = firstRef.current;
    const second = secondRef.current;
    if (!first || !second) return;
    const films = [first, second];

    for (const film of films) {
      film.defaultPlaybackRate = RATE;
      film.playbackRate = RATE;
    }
    if (!onScreen) {
      for (const film of films) film.pause();
      return;
    }

    let switching = false;
    let frame = 0;
    let settle = 0;

    /** Only the take in `current` stays visible; the other waits, hidden. */
    const show = () => {
      films.forEach((film, i) => {
        const on = i === current.current;
        film.style.opacity = on ? "1" : "0";
        film.style.zIndex = on ? "2" : "1";
        if (!on) {
          film.pause();
          film.style.transition = "none";
          film.style.scale = "1";
        }
      });
    };

    show();
    films[current.current]!.play().catch(() => {});

    const watch = () => {
      frame = requestAnimationFrame(watch);
      const now = films[current.current]!;
      if (switching || !now.duration) return;
      if (now.duration - now.currentTime > TAKEOVER * RATE) return;

      switching = true;
      const next = films[1 - current.current]!;
      next.currentTime = 0;
      next.style.transition = "none";
      next.style.scale = String(PUSH_IN);
      next.style.zIndex = "3";
      next.play().catch(() => {});
      // Commit the starting state so both changes below are animated.
      void next.offsetWidth;
      next.style.transition = `opacity ${TAKEOVER}s cubic-bezier(0.2, 0.6, 0.3, 1), scale ${PULL_BACK}s cubic-bezier(0.45, 0, 0.25, 1)`;
      next.style.opacity = "1";
      next.style.scale = "1";
      settle = window.setTimeout(() => {
        current.current = 1 - current.current;
        switching = false;
        show();
      }, TAKEOVER * 1000);
    };
    frame = requestAnimationFrame(watch);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      // A switch cut short by scrolling away finishes at once.
      if (switching) current.current = 1 - current.current;
      show();
      for (const film of films) film.pause();
    };
  }, [onScreen]);

  return (
    <div ref={rootRef} className="absolute inset-0">
      {[firstRef, secondRef].map((ref, i) => (
        <video
          key={i}
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: i === 0 ? 1 : 0, transformOrigin: ORIGIN }}
          muted
          playsInline
          autoPlay={i === 0}
          preload="auto"
          poster={i === 0 ? poster : undefined}
        >
          <source src={src} type="video/mp4" />
        </video>
      ))}
    </div>
  );
}
