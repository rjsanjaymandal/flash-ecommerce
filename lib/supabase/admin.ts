
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export const createAdminClient = () => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Only mock if keys are truly missing
    if (!supabaseUrl || !serviceKey || supabaseUrl.includes('placeholder')) {
      return createClient<Database>('https://placeholder.supabase.co', 'placeholder')
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
