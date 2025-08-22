import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Vercel won’t block your build if lint errors exist
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
