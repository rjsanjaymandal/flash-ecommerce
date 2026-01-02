import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PostHogProvider } from "./providers/posthog-provider";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "./providers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { getUnifiedAuth } from "@/lib/supabase/auth-helper";
import { Snowfall } from "@/components/ui/snowfall";

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
};

export const metadata: Metadata = {
  title: {
    default: "FLASH | Queer & Inclusive Fashion",
    template: "%s | FLASH",
  },
  description:
    "Bold, affirming fashion for everyone. Shop our collection of gender-inclusive apparel.",
  metadataBase: new URL("https://flashhfashion.in"),
  openGraph: {
    title: "FLASH | Queer & Inclusive Fashion",
    description: "Bold, affirming fashion for everyone.",
    url: "https://flashhfashion.in",
    siteName: "FLASH",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FLASH | Queer & Inclusive Fashion",
    description: "Bold, affirming fashion for everyone.",
  },
  verification: {
    google: "CqVr1TGrfamesut-wOLLkyz2PQUjYb-ihMDqj9zL2X0",
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
        <PostHogProvider>
          <Providers
            initialUser={user}
            initialSession={session}
            initialProfile={profile}
          >
            <NuqsAdapter>
              <Snowfall />
              {children}
              <Analytics />
            </NuqsAdapter>
          </Providers>
        </PostHogProvider>
        <OrganizationJsonLd />
      </body>
    </html>
  );
}
