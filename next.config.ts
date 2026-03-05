import type { NextConfig } from "next";

const nextConfig = (phase: string): NextConfig => ({
  // Removal of NEXT_IS_BUILD from runtime env - handled via build-time only detection in clients
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'gyizmixhmrfwywvafdbi.supabase.co' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'photos.google.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' }
    ],
    dangerouslyAllowSVG: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons'],
  },
  async rewrites() {
    return [
      { source: '/auth/v1/callback', destination: '/auth/callback' },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Link',
            value: '<https://res.cloudinary.com>; rel=dns-prefetch, <https://www.googletagmanager.com>; rel=dns-prefetch',
          },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://checkout.razorpay.com https://va.vercel-scripts.com https://cdn.jsdelivr.net https://vercel.live;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' blob: data: https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://stats.g.doubleclick.net https://res.cloudinary.com https://images.unsplash.com https://gyizmixhmrfwywvafdbi.supabase.co https://plus.unsplash.com https://images.pexels.com https://photos.google.com https://lh3.googleusercontent.com https://*.googleusercontent.com;
              font-src 'self' data: https://fonts.gstatic.com;
              connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://stats.g.doubleclick.net https://gyizmixhmrfwywvafdbi.supabase.co https://checkout.razorpay.com wss://gyizmixhmrfwywvafdbi.supabase.co https://vitals.vercel-insights.com https://*.vercel.live;
              frame-src 'self' https://checkout.razorpay.com https://vercel.live;
              media-src 'self' https://res.cloudinary.com;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              upgrade-insecure-requests;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ],
      },
    ];
  },
});

export default nextConfig;
