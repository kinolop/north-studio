import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/studio";

/**
 * Every page on the site, listed for crawlers.
 *
 * Written out by hand rather than discovered from the filesystem: the route
 * count is six and static, and a hand-written list is the one place where a
 * page that should *not* be indexed can be left off deliberately rather
 * than by accident.
 *
 * `priority` and `changeFrequency` are deliberately absent. Google has said
 * for years that it ignores both, and inventing numbers for them only
 * makes the file look more authoritative than it is. `lastModified` is the
 * build time, which for a statically generated site is exactly when the
 * content last changed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    "/",
    "/work/north-agent",
    "/work/north-flow",
    "/work/orbita",
    "/work/noctura",
    "/privacy",
  ].map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    lastModified,
  }));
}
