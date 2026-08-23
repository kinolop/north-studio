/**
 * MONOLITH's identity — the part of it that is the same in every language.
 *
 * The practice is invented, and so are the address, the telephone and the
 * mailbox. They live here rather than in the dictionaries for the same
 * reason `LEGAL` does in `lib/studio.ts`: a string that is identical in RU
 * and EN and duplicated per locale is two chances to publish two different
 * versions of it. The translatable half — labels, prose, the street address
 * — is in `monolithCase` in the dictionaries.
 *
 * Image paths are here for the same reason: a file path is not translatable
 * and a second copy of it is a second thing to forget when a picture is
 * replaced.
 */
export const MONOLITH = {
  wordmark: "MONOLITH",
  founded: "2014",
  mail: "office@monolith-arch.ru",
  phone: "+7 812 000-14-14",
} as const;

/**
 * Everything in `public/work/monolith/`. Four projects and two full-bleed
 * plates — the exact six files the case ships with, named here once so a
 * renamed picture is one edit rather than five.
 */
export const MONOLITH_IMAGES = {
  hero: "/work/monolith/hero.webp",
  material: "/work/monolith/material.webp",
} as const;

/**
 * Project previews, keyed by the project keys in the dictionaries. Keyed
 * rather than positional, so reordering the copy can never point a row at
 * the wrong building.
 */
export const MONOLITH_PROJECT_IMAGES: Readonly<Record<string, string>> = {
  plate: "/work/monolith/project-01.webp",
  ridge: "/work/monolith/project-02.webp",
  slot: "/work/monolith/project-03.webp",
  flight: "/work/monolith/project-04.webp",
};
