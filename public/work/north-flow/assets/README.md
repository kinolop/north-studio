# North Flow — drop your files here

Each frame on `/work/north-flow` renders a labelled placeholder until the
matching file exists. Dropping the file is the **only** step: nothing in the
code needs changing, and a missing file never shows a broken image.

| File | Ratio | Where it appears |
| --- | --- | --- |
| `hero.png` | 16:9 | Hero background, slow Ken-Burns drift |
| `hero.mp4` | 16:9 | Optional. If present it replaces `hero.png` |
| `bg-conveyor.png` | 16:9 | Optional. Richer plate behind the conveyor section |
| `bg-cta.png` | 16:9 | Optional. Richer plate behind the closing section |

**Nothing here is required.** Every one of these frames lights itself: with
no file at all, the section draws a coded backdrop — a slow drift of glow,
the site's dither and a legibility scrim — and looks finished. Drop a file
in only when you have art that beats it. Keep any you make very dark and
low-key; the code grades them down hard regardless, because a plate two
stops brighter than expected must not be able to cost the page its
contrast.

The hero's small chrome figure is **not** in this folder: it reuses
`public/work/north-agent/assets/mascot.png`, so one file lights up both
product pages. Drop it there and both heroes fill at once.

The conveyor, the automation journal, the chips and the station marks are
drawn in code and SVG. There is no image to supply for them, and no image
that would look better than the machine itself.

The extension in the table is what the code looks for, so a file in another
format needs renaming, or a path edit in `components/flow/FlowHero.tsx`,
`FlowConveyor.tsx` and `FlowCta.tsx`. WebP or AVIF is worth using over PNG
where you have the option — these plates are full-bleed, and a 2 MB PNG
behind a section is the most expensive thing on the page.
