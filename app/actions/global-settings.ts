'use server'

import { createClient, createStaticClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function getGlobalSettings(key: string) {
  try {
    // Use Static Client for public reads (works during build/SSG)
    const supabase = createStaticClient()
    
    // Add a race condition to force timeout faster if needed, or just handle the error
    const { data, error } = await supabase
      .from('content_globals')
      .select('value')
      .eq('key', key)
      .single()

    if (error) {
       // If it's a specific "PGRST116" (Results contain 0 rows) it's fine
       if (error.code !== 'PGRST116') {
          console.warn(`[getGlobalSettings] Failed to fetch ${key}:`, error.message)
       }
       return null
    }

    return data?.value
  } catch {
      // Network fetch errors (timeouts) end up here
      console.warn(`[getGlobalSettings] Network error fetching ${key} (Timeout/Offline)`)
      
      // Fallback defaults to prevent build crash
      if (key === 'announcement_bar') {
          return { is_active: false, text: 'Welcome', bg_color: '#000000', text_color: '#ffffff' }
      }
      return null
  }
}

export async function updateGlobalSettings(key: string, value: any) {
  const supabase = await createClient()
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('UpdateGlobalSettings: No user found')
    return { error: 'Unauthorized' }
  }

  // Verify Admin (Optional double check, though partial relies on RLS)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  console.log('UpdateGlobalSettings: User Role:', profile?.role)

  if (profile?.role !== 'admin') {
     console.error('UpdateGlobalSettings: User is not admin', user.id)
    return { error: 'Unauthorized: Admin only' }
  }

  // Use Admin Client to bypass RLS for the write
  const adminSupabase = createAdminClient()

  const { error } = await adminSupabase
    .from('content_globals')
    .upsert({ 
        key, 
        value, 
        updated_at: new Date().toISOString() 
        // updated_by: user.id // Removed to fix schema cache error
    })

  if (error) {
    console.error(`Error updating global settings for ${key}:`, error)
    return { error: `Failed to update settings: ${error.message}` }
  }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/settings')
  
  return { success: true }
}
