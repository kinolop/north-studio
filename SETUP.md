# Setup — the two things only you can do

Everything else runs as-is. These need your hands.

---

## 1. Drop in the founder portrait

Put the file in `public/founder.webp`, then set one line in
`components/sections/Founder.tsx`:

```ts
const PORTRAIT_SRC: string | null = "/founder.webp";
```

That's the only change. The vertical-slat reveal and the frame stay exactly
as they are — the placeholder plate simply stops rendering.

**Recommended:** 4:5 portrait, dark and cinematic so it sits inside the
page's light rather than punching a bright rectangle through it. Around
1200×1500 is plenty.

The same instruction is printed inside the empty frame on the live site, so
there is no way to ship without noticing it.

### North Agent page assets

`/work/north-agent` is the one case that carries artwork; `north-flow` and
`orbita` are drawn in code and need no files. A missing file never shows a
broken image — the frame falls back to a labelled placeholder. All of these
go in `public/work/north-agent/assets/`:

| File | Ratio | Where |
| --- | --- | --- |
| `hero.png` | 16:9 | Hero background, slow Ken-Burns drift |
| `hero.mp4` | 16:9 | Optional; replaces `hero.png` when present |
| `mascot.png` | ~1:1 | The chrome figure in the hero. Also read by the North Flow hero |
| `cap-answers.png` | 4:5 | Capability card 1 |
| `cap-knows.png` | 4:5 | Capability card 2 |
| `cap-enroll.png` | 4:5 | Capability card 3 |

There is a copy of this table in that folder's `README.md` too.

**To make the agent actually think:** `lib/northAgent.ts` has one function,
`getAgentReply`. Replace its body with a fetch to a route handler holding
your API key server-side and the page is live — nothing else changes, and
the file documents the exact shape.

### Case-study screenshots

Same idea, in `lib/studio.ts`:

```ts
export const PROJECT_IMAGES: Readonly<Record<string, string>> = {
  meridian: "/work/meridian.webp",
};
```

---

## 2. Russian copy to proofread

All Russian is authored, not machine-translated, and follows your two rules:
**hyphens only** (no `—` or `–` anywhere in Russian prose) and no calques.
The strings you locked in the brief are used verbatim. Everything below I
wrote in the same voice and you should read before launch.

Everything lives in **`lib/i18n/ru.ts`**.

**Read these first — they carry the most weight:**

| Where | Russian |
| --- | --- |
| Manifesto title | «Мастерство - последнее, что нельзя купить.» |
| Manifesto, para 3 | the AI-pipeline paragraph — the most sensitive claim on the site |
| Founder section | «За студией - один человек.» + two paragraphs |
| FAQ | all six answers, especially «с участием ИИ» and the pricing one |
| Services | the three direction names, summaries and bullet lists |
| Agent demo | the six scripted chat turns and the canned reply |
| Configurator | four prompts and twelve choice labels |
| Contact / channels | the three channel one-liners |
| Form | labels, placeholders, success and error text |

**Three notes:**

- **The site quotes no prices.** If you ever want a figure back on the page,
  it has to go in deliberately — nothing is left commented out waiting to be
  switched on.


- **`founder.body`** is an honest draft in your voice. It asserts no name, no
  dates, no employers and no numbers — only that the studio is one person.
  Confirm or rewrite it, and put your actual name in `founder.signature`
  (currently `Основатель, North Studio`).
- **`voices.items`** are still placeholder attributions — role and sector
  only, deliberately no invented names. Replace with real credited quotes and
  delete `voices.placeholderNote`.

### Adding or changing a string

`lib/i18n/types.ts` is the contract. Add a key there and **both** `en.ts` and
`ru.ts` fail to compile until they have it. A half-translated build cannot
ship.

---

## Notes on decisions you may want to revisit

**Language switching is client-side.** EN and RU swap instantly with no
reload, remembered for the session. The trade-off: Russian is not
server-rendered, so Google does not index it. If Russian search traffic
starts mattering more than the switch feeling instant, move to `/ru` route
segments — `lib/i18n/` and `CopyProvider` are already the only two places
that would change.

**Sound is off on every arrival,** including for someone who turned it on
last visit. Browsers would block autoplay anyway, but the real reason is that
a site which makes noise before you ask is a site people close.

**The intro plays once per session** and is skippable. It is server-rendered
so the hero never flashes behind it, and a `<noscript>` rule removes it
entirely when JavaScript is off — otherwise it would never dismiss.
