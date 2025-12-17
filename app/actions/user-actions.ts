'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const pronouns = formData.get('pronouns') as string
  const fit_preference = formData.get('fit_preference') as string

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
      return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
        name, 
        pronouns, 
        fit_preference: (fit_preference === 'none' ? null : fit_preference) as any
    })
    .eq('id', user.id)
  
  if (error) {
      console.error('Profile Update Error:', error)
      return { error: 'Failed to update user profile.' }
  }

  revalidatePath('/account') // Reload account page
  return { message: 'Profile updated successfully!' }
}
