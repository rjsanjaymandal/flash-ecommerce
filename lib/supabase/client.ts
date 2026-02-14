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

  return createBrowserClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      fetch: async (url, options) => {
        const maxRetries = 3
        let delay = 1000 // 1s
        
        for (let i = 0; i <= maxRetries; i++) {
          try {
            const response = await fetch(url, {
              ...options,
              signal: options?.signal || AbortSignal.timeout(30000)
            })
            
            // Retry on 429 (Rate Limit) or 5xx (Server Error)
            if (i < maxRetries && (response.status === 429 || response.status >= 500)) {
               console.warn(`[Supabase] Retry ${i+1}/${maxRetries} after ${delay}ms (Status: ${response.status})`)
               await new Promise(res => setTimeout(res, delay))
               delay *= 2 // Exponential backoff
               continue
            }
            
            return response
          } catch (err) {
            if (i === maxRetries) throw err
            console.warn(`[Supabase] Network Error - Retry ${i+1}/${maxRetries} after ${delay}ms`)
            await new Promise(res => setTimeout(res, delay))
            delay *= 2
          }
        }
        return fetch(url, options) // Final fallback
      }
    }
  })
}
