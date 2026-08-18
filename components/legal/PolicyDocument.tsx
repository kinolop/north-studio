import { linkify, type Policy, type PolicyBlock } from "@/lib/privacy";

/**
 * The privacy policy, set for reading.
 *
 * A server component with no interactivity — the whole document is static
 * text, so none of this needs to reach the browser as JavaScript.
 *
 * Two rules shaped the typography. The document is long (about 17,000
 * characters), so the measure is held near 70 characters and the leading is
 * looser than anywhere else on the site: this is the one page somebody
 * reads top to bottom rather than scans. And the numbering is real
 * structure, not decoration — clause numbers hang in the margin so the
 * hierarchy is visible down the left edge instead of having to be parsed
 * out of each paragraph's first few characters.
 *
 * Nothing is restated or summarised. Every string rendered here is a
 * verbatim slice of `privacy.txt`, dashes and clause numbers included.
 */
export function PolicyDocument({ policy }: { policy: Policy }) {
  return (
    <div className="mx-auto w-full max-w-[52rem] px-gutter">
      <Contents policy={policy} />

      <div className="mt-20 space-y-6 lg:mt-24">
        {policy.blocks.map((block, index) => (
          <Block key={index} block={block} />
        ))}
      </div>
    </div>
  );
}

/**
 * Twelve sections is enough that landing on the right one by scrolling is a
 * chore, and legal pages are almost always opened with a specific question
 * in mind. The list is derived from the headings, so it can never drift
 * out of step with the document.
 */
function Contents({ policy }: { policy: Policy }) {
  return (
    <nav
      aria-label="Содержание"
      className="rounded-[var(--radius-plate)] border border-hairline p-6 sm:p-8 lg:p-10"
    >
      <p className="label-mono">Содержание</p>
      <ol className="mt-7 grid gap-x-10 gap-y-3.5 sm:grid-cols-2">
        {policy.contents.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="group flex gap-3 text-meta text-ash transition-colors duration-[var(--duration-state)] ease-[var(--ease-north)] hover:text-bone"
            >
              <span className="label-mono shrink-0 pt-0.5 transition-colors duration-[var(--duration-state)] group-hover:text-signal-lift">
                {item.number}
              </span>
              <span>{item.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Block({ block }: { block: PolicyBlock }) {
  switch (block.kind) {
    case "section":
      return (
        <h2
          id={block.id}
          // Clears the fixed header when arrived at from the contents list.
          className="scroll-mt-28 pt-14 text-title font-display font-medium text-bone first:pt-0 lg:pt-20"
        >
          {/* The space after the number is a real character, not the
              margin. Spacing a number away from its title with CSS looks
              identical and then vanishes the moment anybody copies the
              page or hears it read aloud. */}
          <span className="pr-2 text-signal-lift tabular-nums">
            {block.number}.
          </span>{" "}
          {block.title}
        </h2>
      );

    case "clause":
      return (
        // The number hangs, so the paragraph's own text keeps one flush
        // left edge however many lines it runs to — which is what makes a
        // wall of numbered clauses scannable. Only from `sm` up: on a phone
        // that indent costs a fifth of the measure and buys nothing.
        <p className="indent-0 text-[1.0625rem] leading-[1.85] text-ash sm:-indent-[4.25rem] sm:pl-[4.25rem]">
          <span className="label-mono pr-2 text-slate">{block.number}</span>{" "}
          <Text value={block.text} />
        </p>
      );

    case "para":
      return (
        <p className="text-[1.0625rem] leading-[1.85] text-ash">
          <Text value={block.text} />
        </p>
      );

    case "bullets":
      return (
        <ul className="space-y-3.5 sm:pl-[4.25rem]">
          {block.items.map((item, index) => (
            // The dash is the document's own character, kept as real text
            // rather than swapped for a CSS marker — a marker would vanish
            // from anything copied off the page.
            <li
              key={index}
              className="-indent-[1.15rem] pl-[1.15rem] text-[1.0625rem] leading-[1.85] text-ash"
            >
              <Text value={item} />
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <dl className="my-4 divide-y divide-hairline border-y border-hairline">
          {block.rows.map((row) => (
            <div
              key={row.label}
              className="grid gap-x-10 gap-y-3 py-6 sm:grid-cols-[15rem_1fr]"
            >
              <dt className="label-mono pt-1">{row.label}</dt>
              <dd className="m-0 space-y-2 text-[1.0625rem] leading-[1.7] text-bone">
                {row.values.map((value, index) => (
                  <p key={index}>
                    <Text value={value} />
                  </p>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      );
  }
}

/**
 * Renders a line, turning the addresses inside it into working links.
 *
 * The policy prints the site's URL and the operator's e-mail several times,
 * including in the clause that tells you where to send a withdrawal of
 * consent. Leaving those as dead text would make the document technically
 * complete and practically useless. The characters are unchanged — only the
 * markup around them differs.
 */
function Text({ value }: { value: string }) {
  return (
    <>
      {linkify(value).map((piece, index) =>
        piece.kind === "link" ? (
          <a
            key={index}
            href={piece.href}
            {...(piece.href.startsWith("http")
              ? { target: "_blank", rel: "noreferrer noopener" }
              : {})}
            className="text-bone break-words underline decoration-hairline decoration-1 underline-offset-[5px] transition-colors duration-[var(--duration-state)] ease-[var(--ease-north)] hover:decoration-signal"
          >
            {piece.value}
          </a>
        ) : (
          <span key={index}>{piece.value}</span>
        ),
      )}
    </>
  );
}
