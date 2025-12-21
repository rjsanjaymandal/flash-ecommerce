'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getReviews(page = 1, limit = 10, search = '') {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  let query = supabase
    .from('reviews')
    .select('*, products(name, main_image_url)', { count: 'exact' })
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
    const supabase = await createClient()
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/admin/reviews')
}

export async function toggleReviewFeature(id: string, isFeatured: boolean) {
    const supabase = await createClient()
    const { error } = await supabase.from('reviews').update({ is_featured: isFeatured } as any).eq('id', id)
    if (error) throw error
    revalidatePath('/admin/reviews')
}

export async function replyToReview(id: string, replyText: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('reviews').update({ reply_text: replyText } as any).eq('id', id)
    if (error) throw error
    revalidatePath('/admin/reviews')
}

export async function approveReview(id: string, isApproved: boolean) {
    const supabase = await createClient()
    const { error } = await supabase.from('reviews').update({ is_approved: isApproved } as any).eq('id', id)
    if (error) throw error
    revalidatePath('/admin/reviews')
}
