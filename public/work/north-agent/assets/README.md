# North Agent — drop your files here

This is the one case whose *page* carries artwork: the hero plate and the
three capability panels are images, and the mascot sits in the hero. The
other two cases (`north-flow`, `orbita`) are drawn entirely in code, and
carry nothing but a cover.

| File | Ratio | Where it appears |
| --- | --- | --- |
| `cover.png` | 8:5 | The card for this case in **Work** on the home page. Not used on the case page itself |
| `hero.mp4` | ~16:9 | **The hero.** Full-bleed behind the headline: autoplay, muted, loop, `playsInline`, `object-fit: cover` |
| `hero-poster.jpg` | matches the video | Poster for that video, at its full resolution. Also what reduced-motion visitors get instead of it |
| `cta-bg.png` | 16:9 | Closing section background, slow Ken-Burns drift |
| `mascot.png` | ~1:1 | **Nothing reads this any more.** Both product heroes are films now, and neither wants a figure standing in front of one |
| `cap-answers.png` | 4:5 | Capability card 1 — answers instantly |
| `cap-knows.png` | 4:5 | Capability card 2 — knows your programme |
| `cap-enroll.png` | 4:5 | Capability card 3 — drives to enrolment |

All of them are filled. A missing file never shows a broken image — the
frame falls back to a labelled placeholder — so you can swap any one of them
at any time by replacing the file.

`hero.png`, `hero-bg.png` and `mascot.png` are all still in this folder but
nothing reads any of them — the film replaced the hero plate outright, and
with it the Ken-Burns drift and the mascot that used to stand beside the
headline. Delete them whenever you like.

Only two sections carry a background, deliberately: the hero and the close.
The live chat, the three capability cards and the count-up figures sit on
the site's flat near-black, and that contrast is the point — putting a
plate behind them too would flatten the whole page into one texture.

The closing plate is graded down hard in code before any text lands on it.
The hero is not graded across the frame at all any more: it carries a
side-weighted scrim that is strong under the type and clears by ~68%, so
the picture stays a picture. Measured against the brightest frame of the
video, the headline keeps 8.1:1 on wide screens and 9.1:1 on a phone, the
product name and the button 9.9:1 or better.

A replacement video should therefore keep its **left third quiet** — that
is where the words live. Bright motion on the right is free.

The extension in the table is what the code looks for, so a replacement in
another format needs renaming or a path edit in
`components/agent/AgentHero.tsx` and `AgentCapabilities.tsx`.

The capability and closing PNGs run roughly 1.4–2.1 MB each. That is
heavier than the page needs — the same art as WebP or AVIF would land under
300 KB with no visible difference on a dark plate. Worth doing before the
site is put in front of paid traffic; harmless until then.

`hero.mp4` is 6.8 MB, at 3392×1856 and 30 fps. It is served from `/public`
untouched, so that number is what a visitor downloads — it streams (the
poster paints first and range requests fill in behind it), but it is the
heaviest single asset on the site. A 1920-wide re-encode would land near
1.5 MB and look identical at this scale, since the frame is already shown
at about a third of its width. Ask if you want that; it is a re-encode, not
a swap, so it is a deliberate quality decision rather than a cleanup.

`cover.png` is the exception and needs no such treatment: the home page
draws it through `next/image`, which re-encodes and resizes it on demand.
The 1.5 MB source reaches the browser as a 57 KB WebP at full lead width
and 22 KB in a stacked card, so leave the master as heavy as you like.
