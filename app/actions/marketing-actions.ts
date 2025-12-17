'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function subscribeToNewsletter(formData: FormData) {
  const email = formData.get('email') as string

  if (!email || !email.includes('@')) {
      return { error: 'Please enter a valid email address.' }
  }

  const supabase = await createClient()

  try {
      // Upsert to avoid "duplicate key" error if user re-subscribes
      const { error } = await supabase
        .from('newsletter_subscribers')
        .upsert({ email }, { onConflict: 'email' })
        .select()
        .single()

      if (error) {
          console.error('Newsletter Error:', error)
          return { error: 'Failed to subscribe. Please try again.' }
      }

      revalidatePath('/')
      return { message: 'Thanks for subscribing! Welcome to the club.' }

  } catch (err) {
      return { error: 'Something went wrong.' }
  }
}
