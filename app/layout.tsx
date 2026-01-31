import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { WebSiteJsonLd } from "@/components/seo/website-json-ld";
import { getUnifiedAuth } from "@/lib/supabase/auth-helper";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

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
    default: "FLASH | Premium Anime Streetwear & Intelligent Queer Fashion",
    template: "%s | FLASH",
  },
  description:
    "Cyberpunk aesthetics meets nano-fabric engineering. Explore FLASH's gender-neutral anime streetwear, queer fashion drops, and premium intelligent clothing for the modern rebel. Fast fashion, fantastic fabric.",
  keywords: [
    "anime streetwear",
    "queer fashion",
    "gender neutral clothing",
    "nano fabric materials",
    "intelligent clothing",
    "cyberpunk aesthetic",
    "japanese streetwear",
    "fast fashion anime",
    "premium japanese fabric",
    "lgbtq fashion brand",
    "streetwear for all",
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
    title: "FLASH | Premium Anime Streetwear & Intelligent Queer Fashion",
    description:
      "Cyberpunk aesthetics meets nano-fabric engineering. Gender-neutral anime streetwear and intelligent clothing for the modern rebel.",
    url: "https://flashhfashion.in",
    siteName: "FLASH",
    images: [
      {
        url: "/flash-logo.jpg",
        width: 1200,
        height: 630,
        alt: "FLASH Anime Streetwear",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FLASH | Anime Streetwear & Intelligent Queer Fashion",
    description:
      "Cyberpunk aesthetics meets nano-fabric engineering. Premium anime apparel and intelligent clothing for all.",
    images: ["/flash-logo.jpg"],
    creator: "@flashhfashion",
  },
  category: "electronics",
  classification: "Anime Streetwear, Queer Fashion, Intelligent Clothing",
  verification: {
    google: "CqVr1TGrfamesut-wOLLkyz2PQUjYb-ihMDqj9zL2X0",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
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
      </body>
    </html>
  );
}
