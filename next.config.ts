import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rimosso il rule 'component-tagger' per evitare blocchi/timeout nei chunk in dev.
};

export default nextConfig;