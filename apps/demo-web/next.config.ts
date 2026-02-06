import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["vocalroute-sdk"],
};

export default nextConfig;
