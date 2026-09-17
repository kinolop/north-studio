"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useCopy } from "@/components/i18n/CopyProvider";
import { InkButton } from "@/components/home/InkButton";
import { PrintLines } from "@/components/motion/PrintLines";
import { TypeText } from "@/components/motion/TypeText";

/**
 * An address that leads nowhere, set on the same sheet as everything else.
 *
 * The number is printed large and struck through in cobalt, the way a
 * wrong line is corrected on a proof, and the page offers the two places
 * people usually meant to reach.
 */
export function NotFound() {
  const copy = useCopy();
  const text = copy.notFound;
  const router = useRouter();

  // The layout's metadata owns <title> and writes it after this page
  // mounts; the tab should still say what happened, so hold it here.
  useEffect(() => {
    const wanted = `${text.meta} - North Studio`;
    const hold = () => {
      if (document.title !== wanted) document.title = wanted;
    };
    hold();
    const watch = new MutationObserver(hold);
    watch.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => watch.disconnect();
  }, [text.meta]);

  return (
    <section className="sheet flex min-h-[100svh] flex-col justify-center pt-28 pb-16">
      <div className="border-t border-ink pt-8 lg:pt-10">
        <p aria-hidden className="poster relative inline-block text-[clamp(7rem,24vw,22rem)] leading-[0.8] text-ink-mute">
          404
          <svg viewBox="0 0 100 12" preserveAspectRatio="none" className="pointer-events-none absolute top-[46%] -left-[1%] h-[0.12em] w-[104%] overflow-visible">
            <path
              d="M0 7 C 14 3, 28 9, 42 6 S 66 3, 80 7 S 95 5, 100 4"
              fill="none"
              stroke="var(--color-cobalt)"
              strokeWidth="0.045em"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="night-strike"
            />
          </svg>
        </p>
        <TypeText
          as="h1"
          trigger="manual"
          lines={text.title}
          className="poster mt-10 text-[clamp(3rem,7vw,7.5rem)] text-ink"
        />
        <PrintLines
          text={text.lede}
          start="top bottom"
          delay={0.6}
          className="mt-6 max-w-[42ch] text-[clamp(1.15rem,1.5vw,1.4rem)] leading-[1.35] text-ink"
        />
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <InkButton onClick={() => router.push("/")}>{text.home}</InkButton>
          <Link href="/#work" className="ink-link text-small font-semibold text-ink">
            {text.work}
          </Link>
        </div>
      </div>
    </section>
  );
}
