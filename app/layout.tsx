import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { WebSiteJsonLd } from "@/components/seo/website-json-ld";
import { getUnifiedAuth } from "@/lib/supabase/auth-helper";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { PWARegister } from "@/components/pwa-register"; // Imported PWA Register

// Fonts are now loaded via CSS @import in globals.css to bypass build-time fetch restrictions
const fontSans = { variable: "--font-sans" };
const fontSerif = { variable: "--font-serif" };
const fontMono = { variable: "--font-mono" };

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Improved for accessibility
  userScalable: true, // Improved for accessibility/SEO
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "FLASH | Minimalist Luxury & Premium Streetwear India",
    template: "%s | FLASH",
  },
  description:
    "Explore FLASH - India's premier minimalist luxury label. Cinematic aesthetic meeting high-performance craftsmanship. Discover our collection of premium streetwear, heavyweight essentials, and artistic apparel.",
  keywords: [
    "luxury clothing brand",
    "minimalist luxury india",
    "premium streetwear",
    "high-end apparel",
    "flash fashion",
    "flashhfashion",
    "minimalist fashion",
    "premium basics india",
    "luxury streetwear delhi",
    "designer streetwear india",
    "cinematic fashion label",
    "heavyweight cotton quality",
    "luxury essentials",
    "flashhfashion clothing",
  ],
  metadataBase: new URL("https://flashhfashion.in"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en-US",
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
  openGraph: {
    title: "Flash Fashion | Flash Clothing & Anime Streetwear India",
    description:
      "Flash Fashion - The ultimate destination for Flash Clothing and Anime Streetwear in India. Experience the Flash revolution.",
    url: "https://flashhfashion.in",
    siteName: "Flash Fashion",
    images: [
      {
        url: "/flash-logo.jpg",
        width: 1200,
        height: 630,
        alt: "Flash Fashion Anime Streetwear",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flash Fashion | Flash Clothing & Anime Streetwear India",
    description:
      "Flash Fashion - The ultimate destination for Flash Clothing and Anime Streetwear in India.",
    images: ["/flash-logo.jpg"],
    creator: "@flashhfashion",
  },
  category: "clothing",
  classification: "Flash Clothing, Anime Streetwear, Queer Fashion",
  verification: {
    google: "CqVr1TGrfamesut-wOLLkyz2PQUjYb-ihMDqj9zL2X0",
    other: {
      "p:domain_verify": "d87d27ac0a1ffe26b15802fa277dde8c",
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FLASH",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, session, profile } = await getUnifiedAuth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased font-sans`}
      >
        <Providers
          initialUser={user}
          initialSession={session}
          initialProfile={profile}
        >
          <NuqsAdapter>{children}</NuqsAdapter>
        </Providers>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <Analytics />
        <GoogleAnalytics gaId="G-2DR5KWRR1R" />
        <PWARegister />
      </body>
    </html>
  );
}
