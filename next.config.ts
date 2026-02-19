import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rimosso il rule 'component-tagger' per evitare blocchi/timeout nei chunk in dev.

  async headers() {
    return [
      // Cache aggressiva per asset statici di Next (sono versionati, quindi sicuri)
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Immagini ottimizzate
      {
        source: "/_next/image",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
      // Per tutte le pagine HTML (e tutto ciò che non è /_next/*): evita cache del browser/CDN.
      // Così Chrome non serve HTML vecchio che punta a chunk JS non più disponibili dopo un deploy.
      {
        source: "/((?!_next/).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
    ];
  },
};

export default nextConfig;