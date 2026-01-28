
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export const createAdminClient = () => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      console.warn('[createAdminClient] Missing role key/URL. Admin operations will fail.')
      // Returning a dummy client that will fail on call but not on initialization
      return createClient<Database>('https://placeholder.supabase.co', 'placeholder')
    }

    return createClient<Database>(
      supabaseUrl,
      serviceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          fetch: (url, options) => {
            return fetch(url, {
              ...options,
              signal: options?.signal || AbortSignal.timeout(30000) // 30s timeout
            })
          }
        }
      }
    )
  } catch (e) {
    console.error('[createAdminClient] Initialization error:', e)
    return createClient<Database>('https://placeholder.supabase.co', 'placeholder')
  }
}
