import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@city-builder/game-core"],
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
