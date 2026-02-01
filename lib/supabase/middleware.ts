import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SITE_URL } from '@/lib/constants'

export async function updateSession(request: NextRequest) {
  // 1. Create an initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Create the Supabase client
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
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


  // 4. Protected Routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!user) {
          const redirectUrl = new URL('/login', SITE_URL)
          return NextResponse.redirect(redirectUrl)
      }

      // Check Role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
          const redirectUrl = new URL('/', SITE_URL)
          return NextResponse.redirect(redirectUrl)
      }

      if (profile.role !== 'admin') {
          const redirectUrl = new URL('/', SITE_URL)
          return NextResponse.redirect(redirectUrl)
      }
  }

  return response
}
