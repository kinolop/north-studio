import type { Metadata } from "next";
import Link from "next/link";

import { PolicyDocument } from "@/components/legal/PolicyDocument";
import { PrintLines } from "@/components/motion/PrintLines";
import { TypeText } from "@/components/motion/TypeText";
import { RollText } from "@/components/paper/RollText";
import { loadPolicy } from "@/lib/privacy";
import { LEGAL } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description:
    "Политика в отношении обработки персональных данных North Studio: какие данные собираются, на каком основании, как хранятся и как отозвать согласие.",
  // A legal page is worth indexing but has nothing to say to a share card.
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "article",
    url: "/privacy",
    title: "Политика конфиденциальности",
  },
};

/**
 * Prerendered at build time.
 *
 * `loadPolicy` reads `privacy.txt` off the filesystem, which is a build-time
 * operation and must stay one: forcing static guarantees the read happens
 * during `next build` and the text is baked into the HTML, rather than the
 * route quietly becoming dynamic one day and asking a Vercel serverless
 * function for a file that was never traced into its bundle.
 */
export const dynamic = "force-static";

export default function PrivacyPage() {
  const policy = loadPolicy();

  return (
    // The site ships in two languages; this document exists only in Russian,
    // so the subtree is marked as such for screen readers and translators.
    <article lang="ru" className="pt-24 pb-band lg:pt-28">
      <header className="sheet">
        <div className="flex items-baseline justify-between gap-6 border-b border-ink pb-3">
          <Link href="/" className="group mark inline-flex items-center gap-3 text-ink hover:text-cobalt">
            <svg aria-hidden viewBox="0 0 24 10" className="h-[10px] w-6">
              <path
                d="M24 5H3M7 1 3 5l4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
            </svg>
            <RollText text="На главную" />
          </Link>
          <span className="mark hidden text-ink-mute sm:inline">
            {LEGAL.entity}, ИНН {LEGAL.inn}
          </span>
        </div>

        <div className="sheet-grid mt-12 gap-y-8 lg:mt-16">
          <TypeText
            as="h1"
            trigger="manual"
            lines={["Политика", "конфиденциальности"]}
            speed={48}
            className="poster col-span-12 text-[clamp(2.6rem,9.4vw,11rem)] text-ink"
          />
          {/* The document's own official name. The heading above is what
              people look for; this is what the text calls itself, and it is
              the first line of the source file rather than a subtitle
              invented for the page. */}
          <div className="col-span-12 lg:col-span-6 lg:col-start-5">
            <PrintLines
              text={policy.documentTitle}
              start="top bottom"
              delay={0.4}
              className="max-w-[40ch] text-[clamp(1.2rem,1.6vw,1.5rem)] leading-[1.35] text-ink"
            />
            <p className="mark mt-4 text-ink-mute sm:hidden">
              {LEGAL.entity}, ИНН {LEGAL.inn}
            </p>
          </div>
        </div>
      </header>

      <div className="mt-16 lg:mt-24">
        <PolicyDocument policy={policy} />
      </div>
    </article>
  );
}
