const nextConfig = {
  images: {
    domains: ['nrdsgtuzpnamcovuzghb.supabase.co', 'avatars.githubusercontent.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Disable React Strict Mode in production to prevent double rendering
  // This is safe because our contexts now have hasFetched guards
  reactStrictMode: process.env.NODE_ENV === 'development',
  
  // Enable experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react'],
  },
  
  // Configure headers for better caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
    ];
  },
};

export default nextConfig;
