# Setup — the three things only you can do

Everything else runs as-is. These need your hands.

---

## 1. Make the brief form deliver (one env var)

The form at **Start a project → Send a brief** posts to
`app/api/contact/route.ts`, which sends through [Resend](https://resend.com).

Add this in **Vercel → Project → Settings → Environment Variables**:

| Variable | Required | Value |
| --- | --- | --- |
| `RESEND_API_KEY` | **yes** | From <https://resend.com/api-keys> |
| `RESEND_FROM` | no | A verified sender, e.g. `North Studio <hello@yourdomain.ru>` |
| `CONTACT_TO` | no | Defaults to `danskr2008@gmail.com` |

For local testing, put the same line in `.env.local`:

```bash
echo "RESEND_API_KEY=re_your_key_here" >> .env.local
```

**Without the key the site still works.** The route answers 503, and the form
shows the error state with your email address as a live `mailto:` link — so a
misconfigured deploy loses nobody. Verified behaviour:

| Case | Response |
| --- | --- |
| Valid brief, key set | Email delivered |
| Valid brief, no key | `503` → form offers the direct address |
| Honeypot filled (bot) | `200`, silently dropped |
| Missing or too-short fields | `422` |

Until you verify a domain with Resend, leave `RESEND_FROM` unset: the default
shared sender only delivers to the Resend account owner's own address, which
is all this form needs.

---

## 2. Drop in the founder portrait

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

The case pages carry no background plates and no image panels inside cards.
The one image `/work/north-agent` reads is the mascot, in
`public/work/north-agent/assets/`:

| File | Ratio | Where |
| --- | --- | --- |
| `mascot.png` | ~1:1 | The chrome figure in the hero. Also read by the North Flow hero |

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

## 3. Russian copy to proofread

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
