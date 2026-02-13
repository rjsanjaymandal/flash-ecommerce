// force-restart-1
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'gyizmixhmrfwywvafdbi.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; img-src 'self' https: data:; script-src 'none'; sandbox;",
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75, 80, 85, 90, 95, 100],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    typedRoutes: true,
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-icons',
      'date-fns',
    ],
  },


  async rewrites() {
    return [
      {
        source: '/auth/v1/callback',
        destination: '/auth/callback',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
