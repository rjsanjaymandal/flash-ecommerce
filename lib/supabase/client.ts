import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'YOUR_SUPABASE_URL_HERE') {
    console.warn('[Supabase] Missing environment variables. Site may be unstable during render.')
    // Fallback to dummy values to prevent crash, real calls will still fail but render will survive
    return createBrowserClient<Database>(
      supabaseUrl || 'https://placeholder.supabase.co', 
      supabaseKey || 'placeholder', 
      {
        global: { fetch: (...args) => fetch(...args) }
      }
    )
  }

  // Detect build phase to avoid network hangs
  const isBuild = process.env.NEXT_IS_BUILD === 'true';
  if (isBuild) {
    return createBrowserClient<Database>(supabaseUrl, supabaseKey, {
      global: {
        fetch: async () => new Response(JSON.stringify([]), { status: 200 })
      }
    });
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}
