import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SITE_URL } from '@/lib/constants'

export async function updateSession(request: NextRequest) {
  console.log('[Middleware] Running for path:', request.nextUrl.pathname)
  // 1. Create an initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Create the Supabase client
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('[Middleware] Supabase env vars missing, skipping session update');
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // A. Update the REQUEST cookies (so Server Components see the change immediately)
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          
          // B. Update the RESPONSE (so the response object we return has the new headers)
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          // C. Set the cookies on the final response
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Refresh the session
  const { data: { user }, error } = await supabase.auth.getUser()
  console.log('[Middleware] User:', user?.id, 'Error:', error?.message)

  // 4. Protected Routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!user) {
          const redirectUrl = new URL('/login', SITE_URL)
          return NextResponse.redirect(redirectUrl)
      }

      // Check Role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
          console.warn('[Middleware] Non-admin user attempted access:', user.id)
          const redirectUrl = new URL('/', SITE_URL)
          return NextResponse.redirect(redirectUrl)
      }
  }

  return response
}
