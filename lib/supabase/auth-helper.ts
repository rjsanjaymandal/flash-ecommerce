import { createClient } from './server'
import { cache } from 'react'

/**
 * Unified Auth Fetcher
 * Optimized to fetch User, Session, and Profile in a single parallel flow
 * to minimize sequential waterfall requests.
 * Memoized via React cache() for per-request deduplication.
 */
export const getUnifiedAuth = cache(async () => {
  // 1. Environment Check for Hostinger Debugging
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!hasUrl || !hasKey) {
    console.error('[getUnifiedAuth] Missing Supabase Configuration:', { hasUrl, hasKey });
    return { user: null, session: null, profile: null };
  }

  try {
    const supabase = await createClient()

    // 2. Fast Session Retrieval
    const { data } = await supabase.auth.getSession()
    const session = data?.session

    if (!session?.user) {
      return { user: null, session: null, profile: null }
    }

    // 3. Parallel Verification & Profile Fetch
    const [userResult, profileResult] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
    ])

    const user = userResult.data?.user || null
    const profile = profileResult.data || null

    return { user, session, profile }
  } catch (error: any) {
    if (error.digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error('[getUnifiedAuth] Critical error:', error)
    return { user: null, session: null, profile: null }
  }
})
