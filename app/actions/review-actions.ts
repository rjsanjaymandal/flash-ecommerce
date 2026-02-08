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

  // 1. Check for Duplicate Review
  const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single()
  
  if (existingReview) {
      return { error: 'You have already reviewed this product.' }
  }

  // 2. Verify Purchase
  // We check if the user has an order with 'delivered', 'shipped', or 'paid' status that contains this product
  let isVerified = false
  const { data: orders } = await supabase
      .from('orders')
      .select('id, status, order_items!inner(product_id)')
      .eq('user_id', user.id)
      .in('status', ['delivered', 'shipped', 'paid'])
      .eq('order_items.product_id', productId)
      .limit(1)

  if (orders && orders.length > 0) {
      isVerified = true
  }

  // Optimize Images (Parallel Uploads)
  let mediaUrls: string[] = []
  if (imageFiles.length > 0) {
      const uploadPromises = imageFiles
          .filter(file => file.size > 0 && file.type.startsWith('image/'))
          .map(async (file) => {
              try {
                  const uploadFormData = new FormData()
                  uploadFormData.set('file', file)
                  const { mobile } = await uploadOptimizedImage(uploadFormData, 'reviews')
                  return mobile
              } catch (err) {
                  console.error('Image processing failed:', err)
                  return null
              }
          })
      
      const results = await Promise.all(uploadPromises)
      mediaUrls = results.filter(url => url !== null) as string[]
  }

  const { error } = await supabase.from('reviews').insert({
    product_id: productId,
    user_id: user.id,
    rating,
    comment,
    user_name: finalName,
    media_urls: mediaUrls,
    is_approved: false, // Moderation first
    is_verified: isVerified
  })

  if (error) {
    console.error(error)
    return { error: 'Failed to submit review' }
  }

  revalidatePath(`/product/${productId}`)
  return { success: true, message: "Review submitted for approval!" }
}

export async function getReviews(productId: string) {
  try {
    const supabase = await createClient()

    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(50)

    return reviews || []
  } catch (error) {
    console.error('getReviews failed:', error)
    return []
  }
}
