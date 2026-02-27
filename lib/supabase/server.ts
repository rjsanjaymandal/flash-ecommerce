import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'



export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

  // Detect build phase to avoid network hangs
  if (process.env.NEXT_IS_BUILD === 'true') {
    return createServerClient<Database>(supabaseUrl, supabaseKey, {
      cookies: { getAll() { return [] }, setAll() {} },
      global: { fetch: async (url) => {
        const urlStr = typeof url === 'string' ? url : (url as any).url || '';
        const body = urlStr.includes('/auth/v1/') ? { session: null, user: null } : [];
        return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
      } }
    });
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      }
    }
  )
}

export function createStaticClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

  // Detect build phase to avoid network hangs
  if (process.env.NEXT_IS_BUILD === 'true') {
    return createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
      global: {
        fetch: async (url) => {
          const urlStr = typeof url === 'string' ? url : (url as any).url || '';
          const body = urlStr.includes('/auth/v1/') ? { session: null, user: null } : [];
          return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
        }
      }
    });
  }

  return createSupabaseClient<Database>(
    supabaseUrl,
    supabaseKey
  )
}
