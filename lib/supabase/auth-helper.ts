import { createClient } from './server'

/**
 * Unified Auth Fetcher
 * Optimized to fetch User, Session, and Profile in a single parallel flow
 * to minimize sequential waterfall requests.
 */
export async function getUnifiedAuth() {
  try {
    const supabase = await createClient()

    // getUser() is the secure source of truth, but we can also get the session 
    // in parallel to reduce waterfalls.
    const [userResult, sessionResult] = await Promise.all([
      supabase.auth.getUser(),
      supabase.auth.getSession(),
    ])

    const user = userResult.data.user
    const session = sessionResult.data.session

    let profile = null
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      profile = data
    }

    return { user, session, profile }
  } catch (error) {
    console.error('[getUnifiedAuth] Critical error:', error)
    return { user: null, session: null, profile: null }
  }
}
