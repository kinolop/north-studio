/**
 * Where each case lives and what it looks like, keyed by the project key in
 * the dictionaries. Kept out of the copy because a path is not translatable.
 *
 * Four cases are not routes in this app: they are static pages built as
 * standalone sites, served whole out of `public/work/<slug>/` and
 * rewritten onto clean URLs in `next.config.ts`. Links to them must ask the
 * browser for a full page load rather than the router for a payload that
 * does not exist.
 */
export interface CaseLink {
  readonly href: string;
  /** The print on the home wall: a 1500x1000 key picture in `public/work/covers/`. */
  readonly cover: string;
  readonly isStatic: boolean;
}

export const CASES: Readonly<Record<string, CaseLink>> = {
  aven: {
    href: "/work/aven",
    cover: "/work/covers/aven.jpg",
    isStatic: true,
  },
  mikron: {
    href: "/work/mikron",
    cover: "/work/covers/mikron.jpg",
    isStatic: true,
  },
  kotelnaya: {
    href: "/work/kotelnaya",
    cover: "/work/covers/kotelnaya.jpg",
    isStatic: false,
  },
  krug: {
    href: "/work/krug",
    cover: "/work/covers/krug.jpg",
    isStatic: false,
  },
  dvor: {
    href: "/work/dvor",
    cover: "/work/covers/dvor.jpg",
    isStatic: true,
  },
  domstroy: {
    href: "/work/domstroy",
    cover: "/work/covers/domstroy.jpg",
    isStatic: true,
  },
  marshrut: {
    href: "/work/marshrut",
    cover: "/work/covers/marshrut.jpg",
    isStatic: false,
  },
  "north-agent": {
    href: "/work/north-agent",
    cover: "/work/covers/north-agent.jpg",
    isStatic: false,
  },
  "north-flow": {
    href: "/work/north-flow",
    cover: "/work/covers/north-flow.jpg",
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
