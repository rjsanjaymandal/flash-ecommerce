'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getReviews(page = 1, limit = 10, search = '') {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  let query = supabase
    .from('reviews')
    .select('*, products(name, main_image_url)', { count: 'exact' })
    .order('is_approved', { ascending: true }) // Pending (false) first
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.ilike('comment', `%${search}%`)
  }

  const { data, error, count } = await query

  if (error) throw error

  return {
    data: data || [],
    meta: {
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }
}

export async function deleteReview(id: string) {
    try {
        const supabase = createAdminClient()
        
        // Get product_id for revalidation
        const { data: review } = await supabase.from('reviews').select('product_id').eq('id', id).single()
        
        const { error } = await supabase.from('reviews').delete().eq('id', id)
        if (error) throw error
        
        revalidatePath('/admin/reviews')
        if (review?.product_id) {
            revalidatePath(`/product/${review.product_id}`)
        }
    } catch (err) {
        console.error('[deleteReview] Failed:', err)
        throw new Error('Could not delete review. Please check server logs.')
    }
}

export async function toggleReviewFeature(id: string, isFeatured: boolean) {
    try {
        const supabase = createAdminClient()
        const { data: review } = await supabase.from('reviews').select('product_id').eq('id', id).single()
        const { error } = await supabase.from('reviews').update({ is_featured: isFeatured } as any).eq('id', id)
        if (error) throw error
        revalidatePath('/admin/reviews')
        if (review?.product_id) revalidatePath(`/product/${review.product_id}`)
    } catch (err) {
        console.error('[toggleReviewFeature] Failed:', err)
        throw new Error('Failed to toggle review feature status.')
    }
}

export async function replyToReview(id: string, replyText: string) {
    try {
        const supabase = createAdminClient()
        const { data: review } = await supabase.from('reviews').select('product_id').eq('id', id).single()
        const { error } = await supabase.from('reviews').update({ reply_text: replyText } as any).eq('id', id)
        if (error) throw error
        revalidatePath('/admin/reviews')
        if (review?.product_id) revalidatePath(`/product/${review.product_id}`)
    } catch (err) {
        console.error('[replyToReview] Failed:', err)
        throw new Error('Failed to post reply. Please try again.')
    }
}

export async function approveReview(id: string, isApproved: boolean) {
    try {
        const supabase = createAdminClient()
        const { data: review } = await supabase.from('reviews').select('product_id').eq('id', id).single()
        const { error } = await supabase.from('reviews').update({ is_approved: isApproved } as any).eq('id', id)
        if (error) throw error
        revalidatePath('/admin/reviews')
        if (review?.product_id) revalidatePath(`/product/${review.product_id}`)
    } catch (err) {
        console.error('[approveReview] Failed:', err)
        throw new Error('Review status update failed.')
    }
}

// Secure Review Creation with Verified Purchase Check
export async function createReview(userId: string, productId: string, rating: number, comment: string) {
    const supabase = await createClient()

    // 1. Verify Purchase: Must have a PAID order containing this product
    const { data: verifiedOrder } = await supabase
        .from('order_items')
        .select('order_id, orders!inner(status, user_id)')
        .eq('product_id', productId)
        .eq('orders.user_id', userId)
        .in('orders.status', ['paid', 'delivered']) 
        .limit(1)
        .single()
    
    // 2. Insert Review (Mark as verified if order exists)
    // Note: If you want to BLOCK non-buyers, throw error here.
    // Use case: Allow all reviews, but tag verified ones? Or Block?
    // Enterprise Strategy: Allow all, but prioritize Verified. 
    // However, for "Verified Purchase" badge, we just store the boolean.
    
    const isVerified = !!verifiedOrder

    const { error } = await supabase.from('reviews').insert({
        user_id: userId,
        product_id: productId,
        rating,
        comment,
        is_verified: isVerified,
        is_approved: false // Default to pending moderation
    })

    if (error) throw error
    revalidatePath(`/product/${productId}`)
    return { success: true, isVerified }
}
