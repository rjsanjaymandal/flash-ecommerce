import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'YOUR_SUPABASE_URL_HERE') {
    throw new Error('Supabase environment variables are missing')
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          signal: options?.signal || AbortSignal.timeout(30000)
        })
      }
    }
  })
}
