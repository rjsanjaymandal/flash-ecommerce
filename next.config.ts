// force-restart-1
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  async rewrites() {
    return [
      {
        source: '/auth/v1/callback',
        destination: '/auth/callback',
      },
    ]
  },
};

export default nextConfig;
