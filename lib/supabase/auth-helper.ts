import { createClient } from './server'

/**
 * Unified Auth Fetcher
 * Optimized to fetch User, Session, and Profile in a single parallel flow
 * to minimize sequential waterfall requests.
 */
export async function getUnifiedAuth() {
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
    // getSession() reads from the local cookie/storage. It's fast.
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return { user: null, session: null, profile: null }
    }

    // 3. Parallel Verification & Profile Fetch
    // We use the ID from the session to fire off the profile query 
    // while simultaneously verifying the user with getUser()
    const [userResult, profileResult] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
    ])

    const user = userResult.data.user
    const profile = profileResult.data

    return { user, session, profile }
  } catch (error: any) {
    if (error.digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error('[getUnifiedAuth] Critical error:', error)
    return { user: null, session: null, profile: null }
  }
}
