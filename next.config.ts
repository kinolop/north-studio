import type { NextConfig } from "next";

/**
 * The two client cases that are not React.
 *
 * DENTAL CLINIC and DOMSTROY were built and delivered as standalone static
 * pages, and they ship here exactly as the clients received them — their own
 * HTML, their own stylesheet, their own script — under `public/work/<slug>/`.
 * Serving the real file rather than a port of it is the point: the case is
 * the deliverable, not a reconstruction of it.
 *
 * The only thing missing is the pretty address. A file in `public` answers on
 * `/work/domstroy/index.html`, and a portfolio link should read
 * `/work/domstroy`, so each slug is rewritten onto its own index. Rewrites,
 * not redirects: the address bar keeps the clean URL, which is also the one
 * the pages declare as canonical.
 *
 * Their assets are referenced from the site root rather than relatively, so
 * the rewritten URL and the direct one both resolve identically.
 */
const STATIC_CASES = ["dental-clinic", "domstroy"] as const;

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return STATIC_CASES.map((slug) => ({
      source: `/work/${slug}`,
      destination: `/work/${slug}/index.html`,
    }));
  },
};

export default nextConfig;
