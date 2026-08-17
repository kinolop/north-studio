# ORBITA — assets

`/work/orbita` is a standalone light product site for an invented fintech
company. It shares no styling with North Studio: its own tokens live in
`components/orbita/orbita.css`, and the studio's fixed chrome is suppressed
for this route in `components/chrome/StudioChrome.tsx`.

## Backgrounds are code, not files

Every section's ground is `components/orbita/OrbitaMesh.tsx` — three mint
and neutral blooms drifting over a pale gradient on 38s/53s/67s periods,
phase-offset per section so no two match. It depends on no asset, so the
page is always alive whatever happens to the image files, and it pauses
per-section the moment that section leaves the viewport.

`bg-hero.png`, `bg-band.png` and `bg-cta.png` are **no longer used**. They
are still in this folder; delete them whenever you like. Ask if you want
them layered back underneath the mesh as texture.

## What each file does

| File | Where it appears |
| --- | --- |
| `hero.mp4` | **Full-bleed hero background** — fills the whole first screen behind the headline. Autoplay, muted, loop, `playsInline`, `object-fit: cover` |
| `hero-visual.png` | Poster for that video, for instant first paint |
| `app-hero.png` | Feature 1 — floating on the mesh, no card |
| `app-transfer.png` | Feature 2 — floating on the mesh, no card |
| `app-insights.png` | Feature 3 — floating on the mesh, no card |
| `feature-security.png` | Security — small, square, floating with a breathing teal glow |
| `lifestyle.png` | The human moment, floating with parallax |
| `cover.png` | 8:5. The card for this case in **Work** on the *studio* home page — not used anywhere on this route |

If the video fails for any reason the hero falls back to the coded mesh at
its richest — still full-bleed, still moving, never a dead still frame. Any
missing still falls back to a soft light card carrying its caption.

## If you replace something

Keep it light. The hero scrim is weighted to the left on wide screens and
turns vertical below 1024px, so a replacement video wants its subject on
the **right** two-thirds of the frame. Text contrast over the mesh was
measured at its worst overlap: headings 14.9:1, body 4.65:1, teal labels
4.74:1 — all above AA, but a darker mesh would eat that margin fast.
