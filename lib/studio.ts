/** Identity that is the same in every language. */
export const STUDIO = {
  name: "North Studio",
  wordmark: "NORTH",
  wordmarkFull: "NORTH STUDIO",
} as const;

/**
 * Who the studio legally is.
 *
 * Deliberately not in the dictionaries: a person's name and a tax number
 * are not translatable, and holding two copies of them would be two chances
 * to publish the wrong one. The footer line and the privacy page both read
 * from here, so the studio's legal identity is stated in exactly one place.
 */
export const LEGAL = {
  entity: "Скрылев Даниил Евгеньевич",
  /**
   * The label stays Russian in both locales. "ИНН" is the name of a
   * specific Russian tax number, not a word that has an English
   * equivalent — translating it to "Tax ID" would make it harder, not
   * easier, to check the number against a registry.
   */
  innLabel: "ИНН",
  inn: "222213690255",
  /** Where the policy lives. Also printed inside the policy text itself. */
  privacyPath: "/privacy",
} as const;

/**
 * Case-study captures, keyed by project. Kept out of the dictionaries
 * because an image path is not translatable — duplicating it per locale
 * would be two places to update and one place to forget.
 *
 * Drop a file in `public/work/` and add its key here; ProjectPlate switches
 * from the generated placeholder plate to the real capture automatically.
 * Recommended: WebP or AVIF, ~1600×1000 for the lead card, ~1200×750 below.
 */
export const PROJECT_IMAGES: Readonly<Record<string, string>> = {
  // meridian: "/work/meridian.webp",
  // halden: "/work/halden.webp",
  // aster: "/work/aster.webp",
};
