'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(formData: FormData) {
  const supabase = await createClient()

  const productId = formData.get('productId') as string
  const rating = Number(formData.get('rating'))
  const comment = formData.get('comment') as string
  const userName = formData.get('userName') as string

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to review.' }
  }

  // Fetch full name from profiles if available
  let finalName = 'Anonymous'
  
  // Try profiles table first
  const { data: profile } = await (supabase.from('profiles') as any)
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()

  if (profile?.first_name) {
      finalName = `${profile.first_name} ${profile.last_name || ''}`.trim()
  } else if (user.user_metadata?.full_name) {
      finalName = user.user_metadata.full_name
  } else if (user.email) {
      finalName = user.email.split('@')[0]
  }

  const { error } = await (supabase.from('reviews') as any).insert({
    product_id: productId,
    user_id: user.id,
    rating,
    comment,
    user_name: finalName
  })

  if (error) {
    console.error(error)
    return { error: 'Failed to submit review' }
  }

  revalidatePath(`/product/${productId}`)
  return { success: true }
}

export async function getReviews(productId: string) {
  const supabase = await createClient()

  const { data: reviews } = await (supabase
    .from('reviews') as any)
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  return reviews || []
}
