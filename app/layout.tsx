import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { PostHogProvider } from './providers/posthog-provider'
import { Analytics } from "@vercel/analytics/next"
import './globals.css'
import { Providers } from './providers'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { OrganizationJsonLd } from '@/components/seo/organization-json-ld'

// import { Geist, Geist_Mono } from 'next/font/google'
// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// })
// 
// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// })

export const viewport: Viewport = {
  themeColor: '#000000',
}

export const metadata: Metadata = {
  title: {
    default: 'FLASH | Queer & Inclusive Fashion',
    template: '%s | FLASH'
  },
  description: 'Bold, affirming fashion for everyone. Shop our collection of gender-inclusive apparel.',
  metadataBase: new URL('https://flashhfashion.in'),
  openGraph: {
    title: 'FLASH | Queer & Inclusive Fashion',
    description: 'Bold, affirming fashion for everyone.',
    url: 'https://flashhfashion.in',
    siteName: 'FLASH',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FLASH | Queer & Inclusive Fashion',
    description: 'Bold, affirming fashion for everyone.',
  },
}

import { createClient } from '@/lib/supabase/server'


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <html lang="en">
      <body
        className={`antialiased overflow-x-hidden`}
        suppressHydrationWarning
      >
        <PostHogProvider>
          <Providers initialUser={user} initialSession={session} initialProfile={profile}>
        <NuqsAdapter>
            <OrganizationJsonLd />
            {children}
            <Analytics />
          </NuqsAdapter>
        </Providers>
        </PostHogProvider>
      </body>
    </html>
  )
}
