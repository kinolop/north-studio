import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The privacy policy, read from the source file rather than retyped.
 *
 * `privacy.txt` at the repo root is the single source of truth. It is a
 * legal document: it gets amended, and every character of it matters. Had
 * this been pasted into a TypeScript literal there would immediately be two
 * copies of the policy and one of them would go stale — so the file is
 * parsed instead, and editing `privacy.txt` is all it takes to change what
 * the page says.
 *
 * Nothing here rewrites the text. The parser only *recognises* the shape
 * the document already has (numbered sections, numbered clauses, dashed
 * lists, one label/value table) so it can be set with real headings and
 * hanging indents instead of ninety-seven identical paragraphs. Every
 * visible string is a verbatim slice of the file, including the numbers and
 * the list dashes, so selecting the rendered page and copying it gives the
 * source text back.
 *
 * This runs at build time: the route is `force-static`, so the read happens
 * once during `next build` and the content is baked into the prerendered
 * HTML. Nothing touches the filesystem at request time on Vercel.
 */

export type PolicyBlock =
  | { kind: "section"; id: string; number: string; title: string }
  | { kind: "clause"; number: string; text: string }
  | { kind: "para"; text: string }
  | { kind: "bullets"; items: readonly string[] }
  | { kind: "table"; rows: readonly { label: string; values: readonly string[] }[] };

export interface Policy {
  /** The document's own title — the first line of the file. */
  readonly documentTitle: string;
  readonly blocks: readonly PolicyBlock[];
  /** Section headings, for the contents list. */
  readonly contents: readonly { id: string; number: string; title: string }[];
}

/** `1. Общие положения` — a top-level heading. */
const SECTION = /^(\d+)\.[ \t]+(\S.*)$/;
/** `1.1. …` or `1.1.1. …` — a numbered clause. */
const CLAUSE = /^(\d+(?:\.\d+)+\.)[ \t]+(\S.*)$/;
/** `— …` — a list item. Em dash, en dash and hyphen all accepted. */
const BULLET = /^([—–-])[ \t]+(\S.*)$/;

/**
 * Both candidates are written out as separate calls with fully literal
 * paths, rather than looped over from an array, and they live in `content/`
 * rather than at the repo root. Both details matter to the build.
 *
 * Next traces which files a server module touches so it can bundle them.
 * When the path is assembled from a variable it cannot tell what will be
 * read, so it falls back to tracing *everything* — with a root-level path
 * that meant the whole project, `public/` included, which on this repo is
 * some 25 MB of video for one case study. Scoping the read to a folder that
 * holds nothing but documents keeps the deployment honest.
 */
function readSource(): string {
  try {
    return readFileSync(join(process.cwd(), "content", "privacy.txt"), "utf8");
  } catch {
    // Fall through to the Markdown spelling.
  }

  try {
    return readFileSync(join(process.cwd(), "content", "privacy.md"), "utf8");
  } catch {
    // Fall through to the error below.
  }

  // Loudly, at build time. A privacy policy that silently renders empty is
  // worse than a build that refuses to finish.
  throw new Error(
    "The privacy policy source is missing. Put the text in " +
      "content/privacy.txt (or content/privacy.md) at the repo root.",
  );
}

export function loadPolicy(): Policy {
  const raw = readSource().replace(/^﻿/, "");
  const lines = raw
    .split(/\r?\n/)
    // Trailing *spaces* only. A trailing tab is meaningful here: it is how
    // the source marks a table label whose value is the list of lines
    // beneath it, and stripping it silently merged all four rows into one.
    .map((line) => line.replace(/ +$/, ""))
    .filter((line) => line.trim().length > 0);

  const [documentTitle = "", ...body] = lines;

  const blocks: PolicyBlock[] = [];
  const contents: { id: string; number: string; title: string }[] = [];

  // Open accumulators. A run of dashed lines becomes one list; a run of
  // tabbed lines and the untagged lines under them become one table.
  let bullets: string[] | null = null;
  let table: { label: string; values: string[] }[] | null = null;

  const closeBullets = () => {
    if (bullets && bullets.length > 0) blocks.push({ kind: "bullets", items: bullets });
    bullets = null;
  };
  const closeTable = () => {
    if (table && table.length > 0) blocks.push({ kind: "table", rows: table });
    table = null;
  };
  const closeAll = () => {
    closeBullets();
    closeTable();
  };

  for (const line of body) {
    const section = SECTION.exec(line);
    if (section) {
      closeAll();
      const [, number, title] = section as unknown as [string, string, string];
      const id = `razdel-${number}`;
      blocks.push({ kind: "section", id, number, title });
      contents.push({ id, number, title });
      continue;
    }

    const clause = CLAUSE.exec(line);
    if (clause) {
      closeAll();
      const [, number, text] = clause as unknown as [string, string, string];
      blocks.push({ kind: "clause", number, text });
      continue;
    }

    const bullet = BULLET.exec(line);
    if (bullet) {
      closeTable();
      // The dash is kept on the item. It is part of the document, and
      // rendering it as a CSS marker instead would drop it from anything
      // copied off the page.
      bullets ??= [];
      bullets.push(line);
      continue;
    }

    // A tab splits a label from its value — section 6 is laid out that way.
    // An empty value means the rows beneath it are the value, as a list.
    if (line.includes("\t")) {
      closeBullets();
      const [label = "", ...rest] = line.split("\t");
      const value = rest.join("\t").trim();
      table ??= [];
      table.push({ label: label.trim(), values: value ? [value] : [] });
      continue;
    }

    // An untagged line directly under a table row belongs to that row.
    if (table && table.length > 0) {
      table[table.length - 1]!.values.push(line);
      continue;
    }

    closeAll();
    blocks.push({ kind: "para", text: line });
  }

  closeAll();

  return { documentTitle, blocks, contents };
}

/**
 * Splits a line so URLs and e-mail addresses can be made clickable.
 *
 * Returns the line as an ordered list of pieces whose text, concatenated,
 * is exactly the input — the linking is presentation, and the words are
 * untouched. A trailing sentence period is deliberately left outside the
 * link: the file ends several sentences with a URL, and swallowing the full
 * stop would send people to a 404.
 */
export type Piece =
  | { kind: "text"; value: string }
  | { kind: "link"; value: string; href: string };

const LINKABLE = /(https?:\/\/[^\s<>()]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;

export function linkify(input: string): readonly Piece[] {
  const pieces: Piece[] = [];
  let cursor = 0;

  for (const match of input.matchAll(LINKABLE)) {
    const start = match.index ?? 0;
    let value = match[0];

    // Punctuation that ends the sentence rather than the address.
    let trailing = "";
    while (value.length > 0 && /[.,;:]$/.test(value)) {
      trailing = value.slice(-1) + trailing;
      value = value.slice(0, -1);
    }
    if (value.length === 0) continue;

    if (start > cursor) pieces.push({ kind: "text", value: input.slice(cursor, start) });
    pieces.push({
      kind: "link",
      value,
      href: value.includes("@") ? `mailto:${value}` : value,
    });
    if (trailing) pieces.push({ kind: "text", value: trailing });
    cursor = start + match[0].length;
  }

  if (cursor < input.length) pieces.push({ kind: "text", value: input.slice(cursor) });
  return pieces.length > 0 ? pieces : [{ kind: "text", value: input }];
}
