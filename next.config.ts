import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera build ID unico per ogni deploy
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },

  async headers() {
    return [
      // TUTTE le pagine HTML - NO CACHE
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
          {
            key: "Surrogate-Control",
            value: "no-store",
          },
        ],
      },
      // Asset statici con hash nel nome - cache lunga (sono immutabili)
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
