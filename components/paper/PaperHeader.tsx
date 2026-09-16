"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useChannelOverlay } from "@/components/contact/ChannelOverlayProvider";
import { InkButton } from "@/components/home/InkButton";
import { useCopy } from "@/components/i18n/CopyProvider";
import { LocaleSwitch } from "@/components/i18n/LocaleSwitch";
import { scrollToSection } from "@/components/motion/SmoothScroll";
import { NAV_IDS, SECTIONS, sectionAt } from "@/lib/sections";
import { subscribeScroll } from "@/lib/scroll";
import { STUDIO } from "@/lib/studio";

import { Logo } from "./Logo";
import { RollText } from "./RollText";

/**
 * The masthead. It steps out of the way while the visitor reads downward
 * and comes back the moment they scroll up, which is when they are looking
 * for it. The logo inside it is the loader's landing spot.
 */
export function PaperHeader() {
  const pathname = usePathname();
  const atHome = pathname === "/";
  const copy = useCopy();
  const { open } = useChannelOverlay();
  const [lifted, setLifted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    let lastY = 0;
    let wasLifted = false;
    let wasHidden = false;
    let renderedId: string = SECTIONS[0].id;

    return subscribeScroll(({ y, index }) => {
      const nextLifted = y > 24;
      if (nextLifted !== wasLifted) {
        wasLifted = nextLifted;
        setLifted(nextLifted);
      }

      const delta = y - lastY;
      if (Math.abs(delta) > 6) {
        const nextHidden = delta > 0 && y > 240;
        if (nextHidden !== wasHidden) {
          wasHidden = nextHidden;
          setHidden(nextHidden);
        }
        lastY = y;
      }

      const id = sectionAt(index).id;
      if (id !== renderedId) {
        renderedId = id;
        setActiveId(id);
      }
    });
  }, []);

  const go = (id: string) => (event: React.MouseEvent) => {
    if (!atHome) return;
    event.preventDefault();
    scrollToSection(id);
  };

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-500 ease-[var(--ease-print)]",
        hidden ? "-translate-y-full" : "translate-y-0",
        lifted
          ? "border-b border-rule bg-paper/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      <div className="sheet flex h-16 items-center justify-between gap-6">
        <Link
          href="/#origin"
          onClick={go("origin")}
          aria-label={STUDIO.name}
          className="shrink-0 text-[1.3rem] text-ink sm:text-[1.45rem]"
        >
          <span data-logo-anchor className="inline-block transition-opacity duration-150">
            <Logo />
          </span>
        </Link>

        <nav aria-label={copy.footer.index} className="hidden items-center gap-8 lg:flex">
          {NAV_IDS.map((id) => {
            const active = atHome && activeId === id;
            return (
              <Link
                key={id}
                href={`/#${id}`}
                onClick={go(id)}
                aria-current={active ? "true" : undefined}
                className={`group relative text-small font-semibold transition-colors duration-300 ${active ? "text-cobalt" : "text-ink hover:text-cobalt"}`}
              >
                <RollText text={copy.sections[id]} />
                <span
                  aria-hidden
                  className={`absolute top-1/2 -left-3 h-1.5 w-1.5 -translate-y-1/2 bg-cobalt transition-transform duration-300 ${active ? "scale-100" : "scale-0"}`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 sm:gap-6">
          {/* Phones get the switch in the footer: here it would push the button off screen. */}
          <span className="hidden sm:block">
            <LocaleSwitch tone="paper" />
          </span>
          <InkButton size="sm" onClick={() => open()}>
            {copy.studio.startProject}
          </InkButton>
        </div>
      </div>
    </header>
  );
}
