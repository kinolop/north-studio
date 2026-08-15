# North Agent — drop your files here

Each frame on `/work/north-agent` renders a labelled placeholder until the
matching file exists. Dropping the file is the **only** step: nothing in the
code needs changing, and a missing file never shows a broken image.

All five are filled. The table is what the code looks for:

| File | Ratio | Where it appears |
| --- | --- | --- |
| `hero.png` | 16:9 | Hero background, slow Ken-Burns drift |
| `hero.mp4` | 16:9 | Optional. If present it replaces `hero.png` |
| `mascot.png` | ~1:1 | The North Agent mascot in the hero. Also reused by the North Flow hero |
| `cap-answers.png` | 4:5 | Capability card 1 — answers instantly |
| `cap-knows.png` | 4:5 | Capability card 2 — knows your programme |
| `cap-enroll.png` | 4:5 | Capability card 3 — drives to enrolment |

Keep them dark and cinematic so they sit inside the page's light rather than
punching a bright rectangle through it. The extension in the table is what
the code looks for, so a replacement in another format needs renaming or a
path edit in `components/agent/AgentHero.tsx` and `AgentCapabilities.tsx`.

These five are PNGs, at roughly 1.4–2.1 MB each. That is heavier than the
page needs — the same art as WebP or AVIF would land under 300 KB with no
visible difference on a dark plate. Worth doing before the site is put in
front of paid traffic; harmless until then.
