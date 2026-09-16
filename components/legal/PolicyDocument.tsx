import { linkify, type Policy, type PolicyBlock } from "@/lib/privacy";

/**
 * The privacy policy, set for reading.
 *
 * A server component with no interactivity: the whole document is static
 * text, so none of this needs to reach the browser as JavaScript.
 *
 * Laid out like the rest of the sheet, as a printed document: the contents
 * hold the left margin and stay in reach while the text runs down the
 * right, each section opening on its own rule with its number in cobalt.
 * The measure is held near 70 characters and the leading is looser than
 * anywhere else on the site, because this is the one page somebody reads
 * top to bottom. Clause numbers hang in the gutter so the hierarchy is
 * visible down the left edge.
 *
 * Nothing is restated or summarised. Every string rendered here is a
 * verbatim slice of `privacy.txt`, dashes and clause numbers included.
 */
export function PolicyDocument({ policy }: { policy: Policy }) {
  return (
    <div className="sheet sheet-grid gap-y-14">
      <Contents policy={policy} />

      <div className="col-span-12 lg:col-span-8 lg:col-start-5">
        <div className="max-w-[46rem] space-y-6">
          {policy.blocks.map((block, index) => (
            <Block key={index} block={block} />
          ))}
        </div>
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
    <nav aria-label="Содержание" className="col-span-12 lg:col-span-3">
      <div className="border-t-2 border-ink pt-5 lg:sticky lg:top-24">
        <p className="mark text-cobalt">Содержание</p>
        <ol className="mt-5 grid gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-1">
          {policy.contents.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="group grid grid-cols-[2rem_1fr] text-small leading-snug text-ink-soft transition-colors duration-300 hover:text-ink"
              >
                <span className="mark pt-[0.2em] text-ink-mute transition-colors duration-300 group-hover:text-cobalt">
                  {item.number}
                </span>
                <span className="ink-link justify-self-start">{item.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
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
          className="grid scroll-mt-28 grid-cols-[auto_1fr] items-baseline gap-x-4 border-t border-ink pt-6 text-[clamp(1.45rem,2.2vw,2.1rem)] leading-[1.15] font-bold tracking-[-0.02em] text-ink [&:not(:first-child)]:mt-16"
        >
          {/* The space after the number is a real character, not the
              margin, so it survives copying and being read aloud. */}
          <span className="poster text-[1.5em] leading-[0.8] text-cobalt tabular-nums">
            {block.number}.
          </span>{" "}
          <span>{block.title}</span>
        </h2>
      );

    case "clause":
      return (
        // The number hangs, so the paragraph keeps one flush left edge
        // however many lines it runs to. Only from `sm` up: on a phone that
        // indent costs a fifth of the measure and buys nothing.
        <p className="text-copy leading-[1.8] text-ink sm:-indent-[3.75rem] sm:pl-[3.75rem]">
          <span className="mark inline-block pr-2 text-cobalt indent-0 sm:w-[3.75rem] sm:pr-0">
            {block.number}
          </span>{" "}
          <Text value={block.text} />
        </p>
      );

    case "para":
      return (
        <p className="text-copy leading-[1.8] text-ink">
          <Text value={block.text} />
        </p>
      );

    case "bullets":
      return (
        <ul className="space-y-3 border-l-2 border-cobalt pl-5 sm:ml-[3.75rem]">
          {block.items.map((item, index) => (
            // The dash is the document's own character, kept as real text
            // rather than swapped for a CSS marker that would vanish from
            // anything copied off the page.
            <li key={index} className="text-copy leading-[1.75] text-ink-soft">
              <Text value={item} />
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <dl className="my-6 border-y-2 border-ink">
          {block.rows.map((row, index) => (
            <div
              key={row.label}
              className={`grid gap-x-8 gap-y-2 py-5 sm:grid-cols-[13rem_1fr] ${index > 0 ? "border-t border-rule" : ""}`}
            >
              <dt className="mark pt-1 text-cobalt">{row.label}</dt>
              <dd className="m-0 space-y-1.5 text-copy leading-[1.6] text-ink">
                {row.values.map((value, i) => (
                  <p key={i}>
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
 * complete and practically useless. The characters are unchanged; only the
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
            className="ink-link font-semibold break-words text-cobalt"
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
