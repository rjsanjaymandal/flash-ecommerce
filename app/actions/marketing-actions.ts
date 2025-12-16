'use server'

import { createClient } from '@/lib/supabase/server'

export async function subscribeToNewsletter(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email || !email.includes('@')) {
    return { error: 'Invalid email address' }
  }

  const { error } = await (supabase.from('newsletter_subscribers') as any).insert({ email })

  if (error) {
    if (error.code === '23505') { // Unique violation
      return {  message: 'You are already subscribed!' } // Not an error strictly
    }
    return { error: 'Failed to subscribe' }
  }

  return { success: true }
}
