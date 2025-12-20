'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function getGlobalSettings(key: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('content_globals')
    .select('value')
    .eq('key', key)
    .single()

  if (error) {
    console.error(`Error fetching global settings for ${key}:`, error)
    return null
  }

  return data?.value
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
