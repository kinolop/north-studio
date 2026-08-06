import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // three ships untranspiled ESM in a few example paths; let Next handle it.
  transpilePackages: ["three"],
};

export default nextConfig;
