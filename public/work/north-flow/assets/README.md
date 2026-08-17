# North Flow — assets

| File | Ratio | Where it appears |
| --- | --- | --- |
| `cover.png` | 8:5 | The card for this case in **Work** on the home page. Not used anywhere on the case page itself |
| `flow-hero.mp4` | ~16:9 | **The hero.** Full-bleed behind the headline: autoplay, muted, loop, `playsInline`, `object-fit: cover` |
| `flow-hero-poster.jpg` | matches the video | Poster for that video, at its full resolution. Also what reduced-motion visitors get instead of it |

Nothing else to drop. Below the hero the page has no background plates and
no image panels: the conveyor, the automation journal, the chips and the
station marks are drawn in code and SVG, and those sections stand on the
site's own near-black.

The hero carries a side-weighted scrim — strong under the type, cleared by
about 68% of the frame — rather than a grade across the whole picture.
Measured against the brightest frame: headline 7.7:1 on wide screens and
10.7:1 on a phone, product name and button 9.1:1 or better. A replacement
video wants its **left third quiet**, since that is where the words live.

`flow-hero.mp4` is 8.5 MB at 3392×1856 and 30 fps, served from `/public`
untouched. See the note in the North Agent folder — the same re-encode
offer applies, and applies harder here, since this is the larger file.

The hero no longer carries the small chrome figure it used to borrow from
`public/work/north-agent/assets/mascot.png`. The film wants a clean frame,
so the figure that stood in front of it went — and with it the last thing
reading that file on either product page.
