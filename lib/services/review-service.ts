'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getReviews(
  search: string = '',
  page: number = 1,
  limit: number = 10
) {
  const supabase = await createClient()
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('reviews')
    .select(`
      *,
      products (
        id,
        name,
        main_image_url
      ),
      profiles (
        id,
        name
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search) {
     // Search on review comment OR product name OR user name
     // Note: complex OR on joined tables is tricky in supabase-js simple filters. 
     // We will search mainly on comment content or try to use a text search if enabled.
     // For simplicity and reliability without backend extensions, we'll filter on the comment field first.
     query = query.ilike('comment', `%${search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching reviews:', error)
    throw error // Propagate error to be handled by caller/suspense
  }

  return {
    data: data || [],
    meta: {
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    },
  }
}

export async function deleteReview(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('reviews').delete().eq('id', id)
  
  if (error) throw error
  
  revalidatePath('/admin/reviews')
  revalidatePath('/product/[slug]', 'page') // Revalidate product pages aggressively if possible, or just rely on time-based
}
