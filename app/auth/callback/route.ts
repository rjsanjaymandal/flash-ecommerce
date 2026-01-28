import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/constants'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Use SITE_URL to prevent 0.0.0.0 redirects
      return NextResponse.redirect(`${SITE_URL}${next}`)
    }
  }

  // Login failed
  return NextResponse.redirect(`${SITE_URL}/auth/auth-code-error`)
}
