import { createClient } from "@/lib/supabase/server"

/**
 * Checks if the current user is an admin.
 * Throws an error if not authorized.
 * Returns the user object if authorized.
 */
export async function requireAdmin() {
    const supabase = await createClient()
    
    // 1. Check Auth (Session)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error('Unauthorized: No session found')
    }

    // 2. Check Profile Role
    // We select 'role' from profiles. 
    // RLS should ideally allow users to read their own role.
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
    
    if (profileError || !profile || profile.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required')
    }

    return user
}
