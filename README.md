# North Studio

The flagship site for a founder-led digital studio. It is meant to *be* the
portfolio rather than describe one: a chrome monogram lit by your cursor,
drifting volumetric fog, and a mercury scroll rail, all held inside a dark
editorial layout.

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:3000. `npm run build` produces the production
bundle, `npm run typecheck` runs TypeScript with no emit.

> The first `npm install` and the first build both need network access —
> `next/font` downloads and self-hosts the typefaces at build time.

**→ [SETUP.md](SETUP.md) covers the two things only the founder can do:**
where to drop the portrait, and the Russian strings to proofread.

---

## The concept

North Studio is a machined object in a dark room.

"North" is a bearing, so the page is structured as one. Each section carries
a compass heading — `000° / ORIGIN`, `032° / STUDIO`, `078° / ENGAGEMENTS` —
and the scroll rail reads the current heading back as you descend. That
replaces the generic `01 / 02 / 03` numbering: the number encodes real
position in the narrative, and it is specific to this brand rather than
transplantable to any other.

---

## The four signature mechanics

### 1. The chrome N — `components/scene/`

| File | Role |
| --- | --- |
| `nGlyph.ts` | Builds the letter as a ten-point polygon, then extrudes it |
| `ChromeN.tsx` | Material, idle motion, pointer response |
| `StudioRig.tsx` | The lighting rig |
| `CursorLamp.tsx` | The moving specular hotspot |
| `HeroScene.tsx` | Canvas, render budget, visibility gating |

The glyph is **constructed, not loaded** — no font file, no GLTF, so there
is no network request, no loader state, and the proportions are tunable to
the millimetre. The two long edges of the diagonal are parallel by
construction, which keeps the stroke weight constant along its run.

The bevel is the whole effect. A flat extrusion catches one broad reflection
and reads as plastic; a bevelled edge catches a thin moving specular line at
every corner, which is what makes it read as machined metal.

The lighting is **lightformers, not an HDRI**. drei's `Environment` presets
fetch several megabytes from a CDN; `StudioRig` renders a 256px cubemap
on-device from authored light shapes — a broad overhead softbox, two narrow
side strips for the long specular streaks, a rim behind, and one violet card
that is the only colour the metal ever picks up.

`MeshPhysicalMaterial` with `metalness: 1`, not `MeshTransmissionMaterial`:
transmission models glass, and this is a billet with weight to it.
`anisotropy: 0.32` stretches highlights slightly along the extrusion.

### 2. The cursor as a light source — `lib/pointer.ts`, `components/atmosphere/CursorLight.tsx`

The pointer is sampled **once**, damped once, and published once, because
three consumers need it. Three listeners would mean three subtly different
lights and three times the per-frame work.

It lights three things:

- **The metal.** `ChromeN` rotates `scene.environmentRotation` with the
  pointer, which sweeps every reflection across the surface at once. A
  moving light alone would only move one highlight; this moves the whole
  room the object stands in — and costs nothing, because the cubemap is
  never re-rendered.
- **The fog.** The shader lifts the vapour it passes through.
- **The page.** `CursorLight` renders a wide, faint bloom plus a machined dot
  grid that exists everywhere but is masked to nothing except where the light
  falls. The darkness has a surface, and moving the cursor is what proves it.

Degradation is built in: a fine pointer follows the cursor, a coarse pointer
gets a slow Lissajous sweep with two incommensurable frequencies so it never
visibly repeats, and reduced motion parks the light off-centre and stops.

### 3. The liquid-metal scroll rail — `components/chrome/ScrollRail.tsx`

A goo filter (blur, then a hard alpha ramp) is applied to plain white shapes
**inside an SVG mask**; the visible artwork is a single chrome-gradient
rectangle showing through that mask. Filtering the artwork directly would
smear the gradient into mud — masking keeps the metal crisp while only the
*silhouette* behaves like liquid. A little `feTurbulence` displacement keeps
the edge from being geometrically perfect, because real liquid never is.

A droplet trails the column in proportion to scroll velocity. Scroll hard and
it tears away, the goo stretches a neck between them, and it snaps back when
you stop. Two attribute writes per frame.

Below `md` the rail would eat scarce width, so progress collapses to a
hairline under the header.

### 4. The curl-noise fog — `components/atmosphere/FogCanvas.tsx`, `fog.glsl.ts`

A divergence-free 2D velocity field is derived as the **curl of a scalar
noise potential**, and the density field is advected along it. Because the
field is divergence-free the fog swirls and folds instead of pumping in and
out, which is what makes it read as volume rather than as a moving texture.
Time is the third axis of the noise, so the pattern evolves as well as
drifts and never visibly repeats.

Deliberately **not** React Three Fiber: one quad, one material, no scene
graph, so the reconciler would be pure overhead on a pass that runs behind
the entire page. Raw three keeps it to a single draw call.

Budget: half resolution (invisible on something this soft, quarters the
fragment cost), capped at 30fps, paused on tab blur, one static frame under
reduced motion, and an ordered dither in the shader because a grain overlay
alone cannot fix banding at this dynamic range.

---

## Bilingual EN / RU

Russian is the default; English is a complete second locale, not a
translation layer. Switching is instant and remembered for the session, and
the switch itself is never hidden — `LocaleSwitch` shows both locales at all
times.

The default lives in one constant, `DEFAULT_LOCALE` in `lib/i18n/index.ts`.
`CopyProvider` seeds its state from it and `<html lang>` is set to match, so
flipping the site's language is that one line plus the attribute.

Because locale is React state rather than a route, only `DEFAULT_LOCALE` is
server-rendered, and therefore only that one is indexed. Russian being the
default is what makes the indexed copy the Russian copy. If English search
traffic ever matters, the fix is `/en` route segments rather than a second
default.

`lib/i18n/types.ts` is the contract every locale must satisfy — written as an
explicit interface rather than derived from English, because deriving it
would bake the English *literals* into the type and every Russian string
would fail. A key added to one locale and forgotten in the other is a build
error, not a blank space someone finds in production.

Russian is authored rather than translated, uses hyphens only (never `—`),
and avoids calques. See [SETUP.md](SETUP.md) for what to proofread.

**Two faces, because two scripts.** Archivo carries the Latin display voice
on its `wdth` axis and has no Cyrillic at all. Rather than replace it with a
face covering both — which would cost the width axis the whole display voice
is built on — the stack layers: Latin resolves to Archivo, Cyrillic falls
through to Golos, a grotesk actually drawn for Cyrillic.

## No prices, anywhere

The site never quotes a number. Pricing is settled privately in the first
conversation, and a page that guesses at a figure before that conversation
undercuts the promise it is trying to make.

That is enforced rather than intended: there is no currency symbol, no
numeral group and no "from …" line in either dictionary, and the
configurator was rewritten to output a *direction* instead of a range.
The one allowed framing is "Price on the first call".

What replaced the three priced tiers is **Services** — three directions,
equally weighted, no badges: landing pages & sites, AI agents, automation.
Each card ends in a single "Discuss" that opens the same channel chooser
every other call to action uses.

## Proving the agent

`components/sections/AgentDemo.tsx` plays a scripted conversation and then
lets the visitor type. Describing an assistant convinces nobody; watching
one qualify a lead is the argument.

It is labelled a script, on the panel, in both locales — a "live AI" that
is really six hard-coded strings is the kind of small lie that costs a
studio the client it was trying to win. The seam for making it real is one
function: replace `respond()` with a fetch and nothing else in the file
changes.

## The panel that knows where you are

`lib/useLitPanel.ts` plus the `lit-panel` utility are the site's one
"it reacts to me" surface, shared by every card family — services,
capabilities, features, trust. A pool of light follows the pointer across
the panel and the panel leans up to three degrees toward it.

The hook writes four custom properties straight to the element; the CSS does
everything visible. No springs, no animation frame, and the handler only
runs while a pointer is actually over the card, so a dozen of them cost
nothing until one is touched. Smoothing is a CSS transition, which is why
the lean has the same weight as the rest of the site.

`--lit-hue` carries the accent, so ORBITA's cards light in its cyan without
a second copy of any of this. Capability is *watched*, not sampled once: a
tablet that gains a mouse, or a visitor who turns reduced motion on
mid-visit, changes the answer, and a panel that went dead at mount would
never come back.

## Lighting a section

`Atmosphere` lights the page, but it is `fixed`: it stays put while the page
scrolls, so the gradient anchored near the top of the screen never reaches
the middle of a long one. Cases ended up with a lit hero and a run of flat
near-black under it, which is the clearest tell of a template there is.

`components/atmosphere/SectionBackdrop.tsx` is the fix — light that belongs
to a section and scrolls with it. Four tones (`hero`, `machine`, `faint`,
`close`), each a wash, two slowly drifting volumes, the site's dither and a
scrim that fades to void at both edges so a lit section melts into an unlit
one instead of showing its own rectangle.

Three rules, and the third is the one that matters:

- **Alternate, never stack.** North Flow reads hero → machine → faint →
  close, with Deployment left dark between them. Everything glowing is the
  same as nothing glowing.
- **Contrast is arithmetic, not taste.** Peak accent alpha is 0.13, in a
  hero, under its own grading layer. The brightest point any body text sits
  on composites to 7.0:1 for `--color-ash` and 4.65:1 for `--color-slate`.
  The white dither is the layer that quietly eats that margin — it stays
  under 0.04.
- **Every image slot falls back to it.** A section with no file dropped in
  draws the coded backdrop and looks finished. The slots are an upgrade
  path, never a dependency.

## The three cases

`/work/north-agent`, `/work/north-flow` and `/work/orbita` are the studio's
own, one per direction: the agent, the automation, the site. Each is shown
running rather than described, each is linked from Work as a full-width card
alternating sides, and each registers its own compass sweep through
`SectionRegistry` so the HUD and the rail describe the page you are actually
on — 310° for the agent, 285° for the flow, 045° for ORBITA.

All three are labelled a demo concept, in both locales, and every figure on
them says so beside itself. The invented brands (LEKTA, ВОЛНА, ORBITA) exist
so the work can be shown doing its job on something concrete; nothing on any
of the three asserts a measured client result.

**ORBITA is the odd one, and now completely so.** The other two are our
products speaking in our voice. This one is a standalone light product site
for an invented fintech company, and it shares nothing visual with the rest
of this site: its own tokens (`components/orbita/orbita.css`, all namespaced
`--o-*` under a `.orbita` scope), its own typeface loaded on that route
only (Inter, against the studio's Archivo), one mint accent, its own header,
footer, reveal and image component. The studio's fixed chrome — preloader,
atmosphere, header, compass, scroll rail, footer, sound — is suppressed for
the route in `components/chrome/StudioChrome.tsx`, so none of it renders at
all. The studio appears once, as a footnote in ORBITA's footer.

If you are editing that page and reach for a `--color-*`, `label-mono`,
`Section`, `Reveal` or `--ease-north`, you are on the wrong page.

Assets: `public/work/<case>/assets/`, each with a README listing the files
and ratios. Every frame renders a labelled placeholder until the file
exists — or, where we have something better than a dark rectangle to show,
the drawn fallback with the label over it. The flow hero reuses the agent's
`mascot.png` rather than keeping a second copy.

## Reaching the studio

Three channels — Telegram, WhatsApp, email — defined once in
`lib/channels.ts` and consumed by all four surfaces that show them: the
full-screen chooser, the panel under the final CTA, the footer, and the brief
form's reply-to selector. Three copies of a phone number is three chances for
one of them to be wrong after a change.

Every "Start a project" on the page calls the same `open()` from
`ChannelOverlayProvider`. One dialog, one focus trap, one scroll lock.

The close carries a second control beside it, linking out to the studio's
Telegram channel. It wears the same primary treatment rather than a quieter
one: the accent, the bloom and the magnetic pull are what make a control read
as ours, and a downgraded variant would have looked bolted on.

There was a brief form here, posting to a mail route. It never delivered and
both are gone — the form, the route, and the `form` block in both
dictionaries. The site now has no server routes at all and prerenders in
full.

## Structure

```
app/
  layout.tsx        fonts, metadata, the fixed chrome
  page.tsx          section order
  globals.css       ALL design tokens (@theme) + primitives + keyframes
  work/north-agent/ the AI-agent product case
  work/north-flow/  the automation product case
  work/orbita/      the site case — an invented brand, its own landing
components/
  atmosphere/       fog, cursor light, grain, dither — the lit room
  scene/            the chrome N and its rig
  chrome/           header, scroll rail, compass HUD, preloader, sound, footer
  contact/          channel chooser and channel panel
  i18n/             CopyProvider + locale switch
  motion/           Lenis + GSAP wiring
  sections/         the eleven movements
  agent/            the North Agent case's sections
  flow/             the North Flow case's sections, and the conveyor
  orbita/           ORBITA's sections, its mark, its orbit, its app screens
  ui/               Reveal, SplitLines, MagneticButton, Eyebrow, GhostWord
lib/
  i18n/             types.ts (the contract) + en.ts + ru.ts
  channels.ts       Telegram / WhatsApp / email — one source of truth
  sections.ts       ids and compass bearings (language-neutral)
  conveyor.ts       the North Flow line's timing contract and its journal
  format.ts         numbers, punctuated for the reader's language
  recommend.ts      maps configurator answers to a service + timeline
  dither.ts         the Bayer matrix, shared by every use of the motif
  sound.ts          synthesised drone and transients
  pointer.ts        one damped pointer signal
  scroll.ts         one scroll signal (progress, velocity, active section)
  useReveal.ts      fail-safe scroll reveals
  useCountUp.ts     figures that count once, when they are looked at
  useOnScreen.ts    is this on screen right now (for things that should stop)
```

Three rules keep it maintainable: **`globals.css` is the only place raw
values live**, **`lib/i18n/` is the only place copy lives**, and **anything
duplicated across surfaces gets a single module** (channels, sections,
dither).

## The recurring motifs

- **Dithering** — one 4×4 Bayer matrix in `lib/dither.ts` drives all of it:
  the preloader's assembly order, the founder plate, the case plates, the
  configurator panel. Error-diffusion would look more photographic but has no
  repeating grid, and the grid is the point — it rhymes with the technical
  plates and the compass ticks.
- **Vertical slats** — the founder portrait opens through a shutter rather
  than fading.
- **Ghosted giant word** — `GhostWord`, set far below the contrast floor
  behind the engagement cards, the configurator readout and the close. If you
  can read it comfortably it has stopped being a background.
- **Line-art instruments** — the compass HUD and the configurator readouts.
- **Oversized type against mono readouts** — throughout.

---

## Swapping in real content

### Project screenshots

`components/sections/ProjectPlate.tsx` already branches on `project.image`.
Drop a capture into `public/work/` and add one line in `lib/content.ts`:

```ts
{
  key: "meridian",
  name: "Meridian",
  discipline: "Roastery / Direct-to-consumer",
  summary: "…",
  year: "2026",
  engagement: "Studio",
  image: "/work/meridian.webp",   // ← the only change needed
}
```

Nothing else changes — `next/image` takes over with the same hover
behaviour. Use WebP or AVIF, roughly 1600×1000 for the lead card and
1200×750 for the two below it.

Until then, each card draws a machinist's plate — crop marks, a dimension
rule, a technical grid, and the monogram sitting on it like a part on a
bench. It reads as an intentional abstract rather than a grey box. A visible
note in the section says these are placeholders; **delete
`WORK.placeholderNote` once real captures are in.**

### Testimonials

`VOICES.items` in `lib/content.ts`. These ship with **role-and-sector
attributions only** (`Founder` / `B2B logistics platform`) — deliberately, so
nothing on the site reads as a quote from a named person who never said it.
Replace them with real, credited quotes before launch and delete
`VOICES.placeholderNote`.

### Everything else

Prices and tiers → `ENGAGEMENTS`. Email and availability → `STUDIO`. Section
order and bearings → `SECTIONS` (the rail, the header nav and the footer
index all read from it, so adding a section is one entry plus one component
in `app/page.tsx`).

---

## Notes for whoever works on this next

- **Reveals fail visible, never hidden.** `lib/useReveal.ts` renders content
  visible and only *hides* it after confirming it is below the fold and that
  motion is wanted. The naive approach — opacity 0 plus an
  IntersectionObserver — silently strands every section that is already on
  screen when the page loads scrolled (a `#hash` link, a mid-page reload,
  browser scroll restoration). It also means elements already on screen do
  not animate at all, which is correct: animating what the visitor is already
  looking at is a tell.
- **Only one section is pinned.** Process. More than one or two pins on a
  page starts fighting native scroll. Its panel is sized to fit the viewport
  — a pinned panel taller than the screen crops its own last step.
- **No paid plugins.** GSAP's SplitText is Club-only, so `SplitLines` does
  the one thing needed without the licence. Lines are *authored*, not
  measured, so the break is an editorial decision and the text stays
  selectable and crawlable at all times.
- **Line breaks are sized to the measure.** `--text-hero` is 6.1vw because
  the longest authored line is 23 characters, which at this face's ~0.59em
  average advance is 13.6em. Change the headline copy and re-check that
  number, or the authored breaks will rewrap.
- **The ₽ comes from the system fallback.** U+20BD is outside every Google
  Fonts subset for Geist, so the `price-mono` utility sets prices larger than
  label size — at label tracking the crossbar falls below a pixel and the
  mark reads as a Latin P.
- **The compass is a real instrument.** `CompassHUD` rotates the dial and
  counter-rotates the needle, taking the short way round the circle
  (350° → 010° turns 20°, not 340°). Its tick coordinates are precomputed and
  rounded to three decimals: trigonometry does not serialise identically
  across a hydrate, and the un-rounded version produced a genuine mismatch.
- **The accent has two values.** `--color-signal` (4.4:1) is for dots, rings,
  glows, borders and display-size type. `--color-signal-lift` (8.4:1) is for
  any accent-coloured text at body size.

---

## Performance

The page holds 60fps while scrolling and moving the pointer at the same
time, with a worst single frame of 17ms — one frame, no hitches. That is
measured under software rendering, so a real GPU has headroom on top.

It did not start there. Profiling found three structural problems, each
fixed at the cause rather than tuned around:

**The cursor light was costing eleven frames.** Two full-viewport fixed
layers, one carrying a `mask-image` whose centre was a CSS variable updated
every frame. Moving a mask means regenerating it and repainting everything
beneath — 1.3 million pixels, sixty times a second, for a soft glow. It is
now a 620px element that *moves* by transform, which stays on the
compositor. The dot grid inside it is offset by `(-x mod 34)`; because the
grid is periodic, that makes it look perfectly locked to the page while its
container slides around.

**Every rAF loop ran forever.** The pointer, scroll and compass stores each
held an open animation frame whether or not anything was moving — together
about thirteen frames of pure overhead on a still page. All three now stop
when their damped value reaches its target and wake on the event that
matters (`pointermove`, `scroll`, a section change). A page sitting still
costs nothing.

**The pointer store wrote CSS custom properties to `<html>` every frame,**
which invalidates style for everything that could inherit them. Subscribers
now receive the value and write to their own element.

Smaller cuts, all measured: the fog dropped from six noise evaluations per
pixel to four (forward differences for the curl, one density octave) and
renders below half resolution with a lower tier for weak devices; the hero
canvas dropped MSAA and its DPR ceiling; the N's material lost its clearcoat
lobe, which on a metal this dark bought almost nothing; the scroll rail lost
a `feTurbulence` + `feDisplacementMap` pass that re-evaluated fractal noise
over the filter region on every frame of every scroll; and `.glass` lost its
`backdrop-filter`, because ten of them were each blurring a near-uniform
dark background. Blur is kept only where content genuinely scrolls behind
glass — the header and the overlay.

`lib/quality.ts` reads cores, memory and pointer type once and drops the fog
to a cheaper tier on low-end machines.

## Accessibility

Single `h1`, no heading-level skips, visible focus rings on everything, skip
link, `aria-expanded`/`aria-controls` on the FAQ, no icon-only controls
without labels, and body text at 17:1 contrast (secondary 7.7:1, tertiary
5.1:1).

`prefers-reduced-motion` is honoured end to end, not just in CSS: the 3D
scene holds one composed pose, the fog renders a single static frame, the
pointer light parks, Lenis never initialises, the ScrollTrigger pin never
builds, magnetic hover is skipped, and every reveal resolves to its final
state.

three, R3F and drei are dynamically imported and never block first paint.
The 3D canvas drops to `frameloop="demand"` the moment it leaves the
viewport, so scrolling past the hero costs zero GPU for the rest of the page.
