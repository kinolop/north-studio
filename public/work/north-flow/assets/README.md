# North Flow — drop your files here

Each frame on `/work/north-flow` renders a labelled placeholder until the
matching file exists. Dropping the file is the **only** step: nothing in the
code needs changing, and a missing file never shows a broken image.

| File | Ratio | Where it appears |
| --- | --- | --- |
| `hero.jpg` | 16:9 | Hero background, slow Ken-Burns drift |
| `hero.mp4` | 16:9 | Optional. If present it replaces `hero.jpg` |

The hero's small chrome figure is **not** in this folder: it reuses
`public/work/north-agent/assets/mascot.png`, so one file lights up both
product pages. Drop it there and both heroes fill at once.

The conveyor, the automation journal, the chips and the station marks are
drawn in code and SVG. There is no image to supply for them, and no image
that would look better than the machine itself.

Keep the hero dark and cinematic so it sits inside the page's light rather
than punching a bright rectangle through it. WebP or AVIF is preferable to
JPEG where you have the option; the extension in the table is what the code
looks for, so rename accordingly or update the path in
`components/flow/FlowHero.tsx`.
