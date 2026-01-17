import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "./providers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { getUnifiedAuth } from "@/lib/supabase/auth-helper";

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
  maximumScale: 1,
  userScalable: false, // Intentional for "App-like" feel requests
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "FLASH | Anime Streetwear & Japanese Aesthetic Urban Clothing",
    template: "%s | FLASH",
  },
  description:
    "Elevate your vibe with premium anime hoodies, graphic tees, and Harajuku techwear. Shop high-quality, urban anime apparel for the one-person empire.",
  metadataBase: new URL("https://flashhfashion.in"),
  openGraph: {
    title: "FLASH | Anime Streetwear & Japanese Aesthetic Urban Clothing",
    description: "Premium anime hoodies, graphic tees, and Harajuku techwear.",
    url: "https://flashhfashion.in",
    siteName: "FLASH",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FLASH | Anime Streetwear & Japanese Aesthetic Urban Clothing",
    description: "Elevate your vibe with premium anime apparel.",
  },
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
          <NuqsAdapter>
            {children}
            <Analytics />
          </NuqsAdapter>
        </Providers>
        <OrganizationJsonLd />
      </body>
    </html>
  );
}
