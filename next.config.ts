import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    cpus: 2,
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
