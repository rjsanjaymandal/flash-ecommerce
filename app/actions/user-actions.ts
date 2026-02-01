'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  pronouns: z.string().optional(),
  fit_preference: z.enum(['oversized', 'regular', 'slim', 'none']).optional(),
});

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const rawData = {
    name: formData.get('name'),
    pronouns: formData.get('pronouns'),
    fit_preference: formData.get('fit_preference'),
  };

  const parsed = profileSchema.safeParse(rawData);

  if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
  }

  const { name, pronouns, fit_preference } = parsed.data;

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
