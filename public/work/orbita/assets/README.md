# ORBITA — assets

`/work/orbita` is a standalone light product site for an invented fintech
company. It shares no styling with North Studio: its own tokens live in
`components/orbita/orbita.css`, and the studio's fixed chrome is suppressed
for this route in `components/chrome/StudioChrome.tsx`.

| File | Where it appears |
| --- | --- |
| `hero-visual.png` | Hero, right-hand card. Slow drift |
| `app-hero.png` | Feature 1 — every bank in one clean view |
| `app-transfer.png` | Feature 2 — money that arrives while you watch |
| `app-insights.png` | Feature 3 — see exactly where it goes |
| `feature-security.png` | Security section |
| `lifestyle.png` | The human moment, beside the warm line |

**All six supplied files are 1280×714 (16:9), so every frame renders at
16:9** and nothing is cropped — measured at 99% of each image visible. The
three app screens are presented as floating UI cards rather than inside
portrait phone bezels: a 9:19 frame would have shown about a quarter of a
16:9 screenshot. If you later supply genuinely portrait phone captures, swap
the frames in `components/orbita/OrbitaFeatures.tsx` back to the `.o-device`
class and a `9 / 19` ratio, both of which are still in the stylesheet.

A missing file never shows a broken image: `OrbitaImage` falls back to a
soft light card carrying the mint mark and the file's caption, so the page
still reads as finished.

Keep replacements light and airy — this page is off-white throughout, and a
dark or heavily saturated image will fight everything around it.
