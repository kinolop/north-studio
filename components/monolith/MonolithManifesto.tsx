"use client";

import { useCopy } from "@/components/i18n/CopyProvider";

import { MonolithReveal } from "./MonolithReveal";

/**
 * One screen, one sentence, and nothing else on it.
 *
 * The emptiness is the section. A practice whose whole argument is that it
 * removes things cannot make its manifesto share a screen with a lede, a
 * figure and a call to action — so it does not, and the sentence gets a full
 * viewport of the palest pour on the page to sit in.
 *
 * The line breaks are authored in the dictionary rather than left to the
 * browser: "Бетон не отделывают." and "Его оставляют." are two statements,
 * and a rewrap that puts them on one line loses the beat between them.
 */
export function MonolithManifesto() {
  const copy = useCopy().monolithCase;

  return (
    <section className="mn-s-95 flex min-h-[86svh] items-center">
      <div className="mn-wrap mn-section w-full">
        <MonolithReveal>
          <p className="mn-mono mn-deboss-fine">{copy.manifesto.label}</p>
        </MonolithReveal>

        <MonolithReveal delay={120}>
          <p className="mn-display mn-deboss mt-[clamp(2.5rem,8vh,5rem)] max-w-[16ch]">
            {copy.manifesto.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </MonolithReveal>
      </div>
    </section>
  );
}
