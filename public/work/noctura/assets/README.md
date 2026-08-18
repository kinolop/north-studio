# NOCTURA — assets

Everything the case at `/work/noctura` loads. Paths are resolved from
`NOCTURA_ASSETS` in `lib/noctura.ts`; nothing here is referenced by a literal
string anywhere else.

Any file that goes missing degrades to an on-theme stand-in rather than to a
broken image or a dead block — see `NocturaPlate` for the pictures and the
coded night layers in `NocturaHero` / `NocturaBooking` for the video. Both
fallbacks are lit, warm and on-brand, so a missing file costs atmosphere, not
the page.

| File | Where it lands |
| --- | --- |
| `hero.mp4` | The hero, full-bleed behind the headline. No poster on purpose: the coded night underneath is a better first frame than a still of a different room would be. |
| `lobby.png` | The manifesto, cropped to 4:5 so the room's height is what reads first. |
| `room-1.png` | The lift, floor 12 — Делюкс. |
| `room-2.png` | The lift, floor 27 — Панорамный люкс. |
| `room-3.png` | The lift, floor 40 — Пентхаус. |
| `spa.png` | The spa, full-bleed at 21:9 with a horizontal scrim. |
| `dining.png` | The restaurant, beside the prose at 16:11. |
| `view.png` | Floor 42, full-bleed at 21:9. |
| `suite.mp4` | The booking section's ambience. The heaviest file here, so it is not fetched until the section is about a screen away. |
| `cover.png` | The card in the studio's Work grid. Currently the same frame as `room-3.png`. |

## Replacing one

Keep the aspect ratios roughly as they are — the frames crop to fixed ratios,
so a portrait file dropped in place of `spa.png` loses its top and bottom. The
photography is graded warm and lit from lamps rather than from a key light;
anything cool or evenly lit will read as a foreign object against the coded
ground, which is warm by design.

The plates dim their source about 6% before it is drawn, because these renders
are exposed for their own frame rather than for a dark page underneath them.
Do not pre-darken a replacement to compensate.
