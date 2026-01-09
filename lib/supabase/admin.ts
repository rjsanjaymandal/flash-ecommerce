
import { createClient } from '@supabase/supabase-js'

export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
}
