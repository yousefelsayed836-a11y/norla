import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: true,
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
