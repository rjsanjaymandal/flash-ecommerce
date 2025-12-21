'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { uploadOptimizedImage } from './upload-images'

export async function submitReview(formData: FormData) {
  const supabase = await createClient()

  const productId = formData.get('productId') as string
  const rating = Number(formData.get('rating'))
  const comment = formData.get('comment') as string
  const userName = formData.get('userName') as string
  const imageFiles = formData.getAll('images') as File[]

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

  // Handle Image Uploads with Optimization
  const mediaUrls: string[] = []
  if (imageFiles.length > 0) {
      for (const file of imageFiles) {
          if (file.size > 0 && file.type.startsWith('image/')) {
              try {
                  const uploadFormData = new FormData()
                  uploadFormData.set('file', file)
                  // Use 'reviews' bucket and get optimized versions
                  const { mobile } = await uploadOptimizedImage(uploadFormData, 'reviews')
                  mediaUrls.push(mobile) // Store the 600px width version
              } catch (err) {
                  console.error('Image processing failed:', err)
                  // Skip failed images but allow review submission
              }
          }
      }
  }

  const { error } = await (supabase as any).from('reviews').insert({
    product_id: productId,
    user_id: user.id,
    rating,
    comment,
    user_name: finalName,
    media_urls: mediaUrls,
    is_approved: false // Default to false for moderation
  })

  if (error) {
    console.error(error)
    return { error: 'Failed to submit review' }
  }

  revalidatePath(`/product/${productId}`)
  return { success: true, message: "Review submitted for approval!" }
}

export async function getReviews(productId: string) {
  const supabase = await createClient()

  const { data: reviews } = await (supabase as any)
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  return reviews || []
}
