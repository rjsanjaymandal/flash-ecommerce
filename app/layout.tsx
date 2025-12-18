import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"
import './globals.css'
import { Providers } from './providers'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  themeColor: '#000000',
}

export const metadata: Metadata = {
  title: {
    default: 'FLASH | Queer & Inclusive Fashion',
    template: '%s | FLASH'
  },
  description: 'Bold, affirming fashion for everyone. Shop our collection of gender-inclusive apparel.',
  metadataBase: new URL('https://flash-ecommerce.vercel.app'),
  openGraph: {
    title: 'FLASH | Queer & Inclusive Fashion',
    description: 'Bold, affirming fashion for everyone.',
    url: 'https://flash-ecommerce.vercel.app',
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers initialUser={user} initialSession={session} initialProfile={profile}>
          <NuqsAdapter>

            {children}
            <Analytics />
          </NuqsAdapter>
        </Providers>
      </body>
    </html>
  )
}
