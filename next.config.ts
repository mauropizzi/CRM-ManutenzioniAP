import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera build ID unico per ogni deploy
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },

  async headers() {
    const isProd = process.env.NODE_ENV === "production";

    return [
      // Asset statici di Next - Safari fix: aggiungere Vary header
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: isProd
              ? "public, max-age=31536000, immutable"
              : "no-store, must-revalidate",
          },
          {
            key: "Vary",
            value: "Accept-Encoding",
          },
        ],
      },
      // Chunk JS specifici - Safari fix
      {
        source: "/_next/static/chunks/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: isProd
              ? "public, max-age=31536000, immutable"
              : "no-store, no-cache, must-revalidate",
          },
          {
            key: "Pragma",
            value: isProd ? "" : "no-cache",
          },
        ],
      },
      // Immagini ottimizzate
      {
        source: "/_next/image",
        headers: [
          {
            key: "Cache-Control",
            value: isProd ? "public, max-age=86400" : "no-store",
          },
        ],
      },
      // Per tutte le pagine HTML: evita cache del browser/CDN
      {
        source: "/((?!_next/).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;