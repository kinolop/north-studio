# ORBITA — drop your files here

Each frame on `/work/orbita` renders something sensible until the matching
file exists. Dropping the file is the **only** step: nothing in the code
needs changing, and a missing file never shows a broken image.

| File | Ratio | Where it appears |
| --- | --- | --- |
| `hero.jpg` | 16:9 | Hero background, slow Ken-Burns drift |
| `hero.mp4` | 16:9 | Optional. If present it replaces `hero.jpg` |
| `shot-1.jpg` | 4:5 | Feature 1 — every account, one balance |
| `shot-2.jpg` | 4:5 | Feature 2 — instant transfer |
| `shot-3.jpg` | 4:5 | Feature 3 — the monthly insight |

The three `shot-*` frames behave differently from the other cases: while
they are empty they draw **the coded app screen** rather than a dark plate,
with the slot label printed over it. So the page is complete as it stands —
drop a render in only if you have one that beats the live mock. Anything you
generate should stay in ORBITA's palette (cold aqua on near-black, `#4ec9dc`
as the accent) and keep the type crisp; a soft render next to the coded
screens will look like the weaker of the two.

The orbital motif, the brand mark and all three app screens are drawn in
code. There is no image to supply for them.

Keep the hero dark and cold so it sits inside the page's light rather than
punching a bright rectangle through it. WebP or AVIF is preferable to JPEG
where you have the option; the extension in the table is what the code looks
for, so rename accordingly or update the paths in
`components/orbita/OrbitaHero.tsx` and `OrbitaProduct.tsx`.
