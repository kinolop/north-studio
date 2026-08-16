# ORBITA — assets

`/work/orbita` is a standalone light product site for an invented fintech
company. It shares no styling with North Studio: its own tokens live in
`components/orbita/orbita.css`, and the studio's fixed chrome is suppressed
for this route in `components/chrome/StudioChrome.tsx`.

## Backgrounds

| File | Where it appears |
| --- | --- |
| `bg-hero.png` | Behind the whole hero, with parallax drift |
| `bg-band.png` | Feature rows 1 and 3, and the security section |
| `bg-cta.png` | The closing section |

Sections alternate rich and clean on purpose: hero image → ticker → coded
mesh → **band image** → plain white → **band image** → security band image →
plain white → coded mesh → soft neutral → closing image → near-black footer.

Where no image is supplied a section falls back to the **coded mesh** — one
mint and one neutral gradient, never a bare white void and never a broken
image.

## Product and content

| File | Where it appears |
| --- | --- |
| `hero.mp4` | The hero visual: autoplay, muted, looping, `playsInline` |
| `hero-visual.png` | Poster for that video, and its fallback if the video fails |
| `app-hero.png` | Feature 1 — every bank in one clean view |
| `app-transfer.png` | Feature 2 — money that arrives while you watch |
| `app-insights.png` | Feature 3 — see exactly where it goes |
| `feature-security.png` | Security section, full width above the three points |
| `lifestyle.png` | The human moment, beside the warm line |

Every supplied still is 1280×714 (16:9) and every frame renders at 16:9, so
nothing is cropped. The app screens are floating UI cards rather than phone
bezels for that reason; `.o-device` and a `9 / 19` ratio are still in the
stylesheet if true portrait captures ever arrive.

## If you replace a background

Keep it light. The scrims are tuned against the files that are here:
measured over the darkest 2% of each image, headings hold 16.6:1, body text
5.3:1 and the teal labels 5.3:1. A darker replacement will eat that margin —
`--o-accent-text` was already darkened once for exactly this reason, because
the original teal fell to 4.0:1 over the closing background.
