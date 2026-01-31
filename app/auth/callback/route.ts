import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/constants'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'
  
  // OAuth errors come in searchParams
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  if (error) {
    console.error('[Auth Callback] OAuth Error:', { error, error_description })
    const errorUrl = new URL('/auth/auth-code-error', SITE_URL)
    errorUrl.searchParams.set('message', error_description || error)
    return NextResponse.redirect(errorUrl)
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (e) {
              // This can be ignored if middleware is handling cookie sync
            }
          },
        },
      }
    )
    
    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      if (exchangeError) throw exchangeError
      
      // Successfully authenticated
      // Robustness: Ensure 'next' is a relative path to prevent open redirect vulnerabilities
      let safeNext = '/'
      if (next && next.startsWith('/') && !next.startsWith('//')) {
        safeNext = next
      }
      
      return NextResponse.redirect(new URL(safeNext, SITE_URL))
    } catch (err: any) {
      console.error('[Auth Callback] Session Exchange Failed:', err)
      const errorUrl = new URL('/auth/auth-code-error', SITE_URL)
      errorUrl.searchParams.set('message', err.message || 'Failed to exchange auth code for session')
      return NextResponse.redirect(errorUrl)
    }
  }

  // No code or error provided - unusual access
  console.warn('[Auth Callback] No code or error in request')
  return NextResponse.redirect(new URL('/login', SITE_URL))
}
