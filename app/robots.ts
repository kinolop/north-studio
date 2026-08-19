import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/studio";

/**
 * Open to crawlers, with one exception.
 *
 * `/api/` is disallowed because nothing under it is a page — the contact
 * endpoint answers POSTs and has no content worth indexing. Everything
 * else, the demo cases and the privacy policy included, is meant to be
 * found.
 *
 * `host` and the absolute sitemap URL both matter during a domain move:
 * they are how a crawler that arrives on an older address learns which one
 * is now canonical.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
    host: SITE_URL,
  };
}
