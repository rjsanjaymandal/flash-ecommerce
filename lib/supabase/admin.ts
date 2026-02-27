
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

    // Detect build phase to avoid network hangs
    if (process.env.NEXT_IS_BUILD === 'true') {
      return createClient<Database>(supabaseUrl, serviceKey, {
        global: {
          fetch: async () => new Response(JSON.stringify([]), { status: 200 })
        }
      });
    }

    return createClient<Database>(
      supabaseUrl,
      serviceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  } catch (e) {
    console.error('[createAdminClient] Initialization error:', e)
    return createClient<Database>('https://placeholder.supabase.co', 'placeholder')
  }
}
