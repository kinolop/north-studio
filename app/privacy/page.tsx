import type { Metadata } from "next";
import Link from "next/link";

import { PolicyDocument } from "@/components/legal/PolicyDocument";
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
    <article lang="ru" className="pt-32 pb-section-tight lg:pt-48">
      <header className="mx-auto w-full max-w-[52rem] px-gutter">
        <Link
          href="/"
          className="label-mono group inline-flex items-center gap-3 transition-colors duration-[var(--duration-state)] ease-[var(--ease-north)] hover:text-bone"
        >
          <svg aria-hidden viewBox="0 0 24 10" className="h-[10px] w-6">
            <path
              d="M24 5H3M7 1 3 5l4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              className="transition-transform duration-[var(--duration-state)] ease-[var(--ease-north)] group-hover:-translate-x-1"
            />
          </svg>
          На главную
        </Link>

        <h1 className="mt-10 text-display font-display font-medium text-bone">
          Политика конфиденциальности
        </h1>

        {/* The document's own official name. The heading above is what
            people look for; this is what the text calls itself, and it is
            the first line of the source file rather than a subtitle
            invented for the page. */}
        <p className="mt-8 max-w-[46ch] text-lead text-ash">
          {policy.documentTitle}
        </p>

        <p className="label-mono mt-10">
          {LEGAL.entity} · ИНН {LEGAL.inn}
        </p>

        <hr className="mt-14 border-0 border-t border-hairline" />
      </header>

      <div className="mt-14 lg:mt-16">
        <PolicyDocument policy={policy} />
      </div>
    </article>
  );
}
