"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { LocaleSwitch } from "@/components/i18n/LocaleSwitch";
import { useChannelOverlay } from "@/components/contact/ChannelOverlayProvider";
import { scrollToSection } from "@/components/motion/SmoothScroll";
import { SECTIONS, NAV_IDS, sectionAt } from "@/lib/sections";
import { subscribeScroll } from "@/lib/scroll";
import { STUDIO } from "@/lib/studio";

export function Header() {
  const pathname = usePathname();
  // Anchors only resolve on the page that owns them. Off the home page the
  // nav has to navigate rather than scroll, and nothing should read as the
  // "current" section, because none of them is.
  const atHome = pathname === "/";
  const [lifted, setLifted] = useState(false);
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);
  const copy = useCopy();
  const { open } = useChannelOverlay();

  useEffect(() => {
    let wasLifted = false;
    let renderedId: string = SECTIONS[0].id;

    return subscribeScroll(({ y, index }) => {
      const nextLifted = y > 32;
      if (nextLifted !== wasLifted) {
        wasLifted = nextLifted;
        setLifted(nextLifted);
      }

      const id = sectionAt(index).id;
      if (id !== renderedId) {
        renderedId = id;
        setActiveId(id);
      }
    });
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50",
        "transition-[background-color,backdrop-filter,border-color] duration-[520ms] ease-[var(--ease-north)]",
        lifted
          ? "border-b border-hairline bg-void/72 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      <div className="container-north flex h-[72px] items-center justify-between gap-6">
        <Link
          href="/#origin"
          onClick={(event) => {
            if (!atHome) return;
            event.preventDefault();
            scrollToSection("origin");
          }}
          className="group flex shrink-0 items-baseline gap-2.5"
          aria-label={`${STUDIO.name} — ${copy.sections.origin}`}
        >
          <span className="text-chrome font-display text-[1.05rem] font-semibold tracking-[-0.02em] [font-variation-settings:'wdth'_112]">
            {STUDIO.wordmark}
          </span>
          <span className="label-mono transition-colors duration-[var(--duration-state)] group-hover:text-ash">
            Studio
          </span>
        </Link>

        <nav aria-label={copy.footer.index} className="hidden items-center gap-9 lg:flex">
          {NAV_IDS.map((id) => {
            const active = atHome && activeId === id;
            return (
              <Link
                key={id}
                href={`/#${id}`}
                onClick={(event) => {
                  if (!atHome) return;
                  event.preventDefault();
                  scrollToSection(id);
                }}
                aria-current={active ? "true" : undefined}
                className={[
                  "relative text-meta transition-colors duration-[var(--duration-state)] ease-[var(--ease-north)]",
                  active ? "text-bone" : "text-slate hover:text-ash",
                ].join(" ")}
              >
                {copy.sections[id]}
                {/* The active nav item is one of the page's few accent moments. */}
                <span
                  aria-hidden
                  className={[
                    "absolute -bottom-2 left-0 h-px w-full origin-left bg-signal",
                    "transition-transform duration-[420ms] ease-[var(--ease-north)]",
                    active ? "scale-x-100" : "scale-x-0",
                  ].join(" ")}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 sm:gap-5">
          <p className="label-mono hidden items-center gap-2.5 2xl:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
            </span>
            {copy.studio.availability}
          </p>

          <LocaleSwitch />

          <button
            type="button"
            onClick={() => open()}
            className="shrink-0 rounded-[var(--radius-control)] border border-hairline px-4 py-2.5 text-meta whitespace-nowrap text-bone transition-[border-color,background-color] duration-[var(--duration-state)] ease-[var(--ease-north)] hover:border-signal/50 hover:bg-white/[0.04] sm:px-5"
          >
            {copy.studio.startProject}
          </button>
        </div>
      </div>
    </header>
  );
}
