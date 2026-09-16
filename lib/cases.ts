/**
 * Where each case lives and what it looks like, keyed by the project key in
 * the dictionaries. Kept out of the copy because a path is not translatable.
 *
 * Two cases are not routes in this app: they are the static pages that were
 * delivered to those clients, served whole out of `public/work/<slug>/` and
 * rewritten onto clean URLs in `next.config.ts`. Links to them must ask the
 * browser for a full page load rather than the router for a payload that
 * does not exist.
 */
export interface CaseLink {
  readonly href: string;
  /** Original file under /public. Never served raw: see `coverSrc`. */
  readonly cover: string;
  readonly isStatic: boolean;
}

export const CASES: Readonly<Record<string, CaseLink>> = {
  domstroy: {
    href: "/work/domstroy",
    cover: "/work/domstroy/images/hero.jpg",
    isStatic: true,
  },
  "dental-clinic": {
    href: "/work/dental-clinic",
    cover: "/work/dental-clinic/images/hero-clinic.png",
    isStatic: true,
  },
  noctura: {
    href: "/work/noctura",
    cover: "/work/noctura/assets/cover.png",
    isStatic: false,
  },
  "north-agent": {
    href: "/work/north-agent",
    cover: "/work/north-agent/assets/cover.png",
    isStatic: false,
  },
  "north-flow": {
    href: "/work/north-flow",
    cover: "/work/north-flow/assets/cover.png",
    isStatic: false,
  },
};

/**
 * The covers ship as 1.5-1.8 MB PNGs. Anything drawn by hand (the canvas
 * plates) goes through the image optimizer instead, at a width from its
 * default `deviceSizes`, so a hover preview never downloads a poster.
 */
export function coverSrc(path: string, width: 640 | 828 | 1080 = 828): string {
  return `/_next/image?url=${encodeURIComponent(path)}&w=${width}&q=75`;
}
