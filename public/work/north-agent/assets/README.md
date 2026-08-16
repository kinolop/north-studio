# North Agent — drop your files here

This is the one case that carries artwork: the hero plate and the three
capability panels are images, and the mascot sits in the hero. The other two
cases (`north-flow`, `orbita`) are drawn entirely in code and have nothing
to drop.

| File | Ratio | Where it appears |
| --- | --- | --- |
| `hero-bg.png` | 16:9 | Hero background, slow Ken-Burns drift |
| `hero.mp4` | 16:9 | Optional. If present it replaces `hero-bg.png` |
| `cta-bg.png` | 16:9 | Closing section background, same slow drift |
| `mascot.png` | ~1:1 | The chrome figure in the hero. Also read by the North Flow hero |
| `cap-answers.png` | 4:5 | Capability card 1 — answers instantly |
| `cap-knows.png` | 4:5 | Capability card 2 — knows your programme |
| `cap-enroll.png` | 4:5 | Capability card 3 — drives to enrolment |

All of them are filled. A missing file never shows a broken image — the
frame falls back to a labelled placeholder — so you can swap any one of them
at any time by replacing the file.

`hero.png` is still in this folder but nothing reads it any more:
`hero-bg.png` replaced it as the hero plate. Delete it whenever you like.

Only two sections carry a background image, deliberately: the hero and the
close. The live chat, the three capability cards and the count-up figures
sit on the site's flat near-black, and that contrast is the point — putting
a plate behind them too would flatten the whole page into one texture.

Both backgrounds are graded down hard in code before any text lands on them
(measured: the white headline keeps 12.9:1 against the brightest patch of
either image, secondary text 5.8:1). So a replacement can be a stop or two
brighter than these without breaking legibility — but keep them dark and
low-key or the grading will start showing as a grey veil.

The extension in the table is what the code looks for, so a replacement in
another format needs renaming or a path edit in
`components/agent/AgentHero.tsx` and `AgentCapabilities.tsx`.

These five are PNGs, at roughly 1.4–2.1 MB each. That is heavier than the
page needs — the same art as WebP or AVIF would land under 300 KB with no
visible difference on a dark plate. Worth doing before the site is put in
front of paid traffic; harmless until then.
