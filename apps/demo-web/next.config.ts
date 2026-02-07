import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["@vocalroute-ai/sdk"],
};

export default nextConfig;
