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
const geistSans = { variable: "" };
const geistMono = { variable: "" };

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
    default: "Flash Fashion (FlashhFashion) | Premium Anime Streetwear India",
    template: "%s | Flash Fashion (FlashhFashion)",
  },
  description:
    "Flash Fashion - The ultimate clothing brand for best quality printed t-shirts and Anime Streetwear in India. Experience the Flash revolution with gender-neutral, cyberpunk, and intelligent nano-fabric apparel.",
  keywords: [
    "clothing brand",
    "best quality clothing",
    "printed tshirts",
    "best printed tshirts",
    "best printed tshirts",
    "flash fashion",
    "flashhfashion",
    "flashh fashion",
    "flash",
    "flash fashion india",
    "flash clothing brand",
    "anime streetwear",
    "queer fashion",
    "gender neutral clothing",
    "nano fabric materials",
    "intelligent clothing",
    "cyberpunk aesthetic",
    "japanese streetwear",
    "premium clothing india",
    "streetwear for all",
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
        <PWARegister />
      </body>
    </html>
  );
}
