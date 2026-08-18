# content

Long-form documents that are text first and page second.

| File | Rendered at | Read by |
| --- | --- | --- |
| `privacy.txt` | `/privacy` | `lib/privacy.ts` |

## Editing the privacy policy

Edit `privacy.txt` and redeploy. That file is the only copy of the policy —
nothing is duplicated into a TypeScript literal — so the page cannot drift out
of step with the legal text, and no code change is needed to amend it.

The parser recognises the shape the document already has and does not rewrite
any of it:

- `1. Заголовок` — a top-level section. Also becomes an entry in the contents
  list and an anchor (`#razdel-1`).
- `1.1. Текст` — a numbered clause. The number is set in the margin.
- `— текст` — a list item. The dash stays part of the text, so copying the
  page gives the source back verbatim.
- `Метка<TAB>значение` — a label/value row. A row whose value is empty takes
  the plain lines beneath it as a list. **The tab matters**: it is what marks a
  label, so keep it if you edit that block.
- Anything else — a plain paragraph.

The first line of the file is the document's own title and is printed under
the page heading. URLs and e-mail addresses anywhere in the text become links
automatically; a full stop that ends the sentence is left outside the link.

## Why this folder exists

Next traces which files a server module reads so it can bundle them. A path
assembled from a variable, or one pointing at the repo root, makes it trace the
whole project — `public/` included, which here is tens of megabytes of case
study video. Keeping these documents in one folder that `lib/privacy.ts`
addresses by a literal path keeps the deployed function small.

So: put documents here, and read them by a literal path.
