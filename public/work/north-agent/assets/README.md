# North Agent — drop your files here

Each frame on `/work/north-agent` renders a labelled placeholder until the
matching file exists. Dropping the file is the **only** step: nothing in the
code needs changing, and a missing file never shows a broken image.

| File | Ratio | Where it appears |
| --- | --- | --- |
| `hero.jpg` | 16:9 | Hero background, slow Ken-Burns drift |
| `hero.mp4` | 16:9 | Optional. If present it replaces `hero.jpg` |
| `mascot.png` | ~1:1 | The North Agent mascot in the hero. Transparent or dark background |
| `cap-answers.jpg` | 4:5 | Capability card 1 — answers instantly |
| `cap-knows.jpg` | 4:5 | Capability card 2 — knows your programme |
| `cap-enroll.jpg` | 4:5 | Capability card 3 — drives to enrolment |

Keep them dark and cinematic so they sit inside the page's light rather than
punching a bright rectangle through it. WebP or AVIF is preferable to JPEG
where you have the option; the extension in the table is what the code looks
for, so rename accordingly or update the paths in
`components/agent/AgentHero.tsx` and `AgentCapabilities.tsx`.
