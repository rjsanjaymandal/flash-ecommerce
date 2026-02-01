'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { WelcomeEmail } from '@/components/emails/welcome-email'

const resend = new Resend(process.env.RESEND_API_KEY)

import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export async function subscribeToNewsletter(formData: FormData) {
  const parsed = schema.safeParse({
    email: formData.get('email'),
  });

  if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
  }

  const { email } = parsed.data;

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

      // Send Welcome Email
      if (process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: 'Flash Fashion <hello@flashhfashion.in>', // User needs to verify domain or use resend.dev for testing
            to: email,
            subject: 'Welcome to the inner circle ⚡',
            react: WelcomeEmail({ userFirstname: 'Friend' }),
          })
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError)
          // Don't fail the request if email fails, just log it
        }
      }

      revalidatePath('/')
      return { message: 'Thanks for subscribing! Check your inbox ⚡' }

  } catch (err) {
      return { error: 'Something went wrong.' }
  }
}
