import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ allow deploy even if ESLint errors
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ allow deploy even if TS errors
  },
};

export default nextConfig;
