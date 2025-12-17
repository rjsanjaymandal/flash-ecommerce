'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCoupons(page = 1, limit = 10, search = '') {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  let query = supabase
    .from('coupons')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.ilike('code', `%${search}%`)
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

export async function createCoupon(coupon: any) {
    const supabase = await createClient()
    const { data, error } = await supabase.from('coupons').insert(coupon).select().single()
    if (error) throw error
    revalidatePath('/admin/coupons')
    return data
}

export async function deleteCoupon(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/admin/coupons')
}

export async function toggleCouponStatus(id: string, active: boolean) {
    const supabase = await createClient()
    const { error } = await supabase.from('coupons').update({ active }).eq('id', id)
    if (error) throw error
    revalidatePath('/admin/coupons')
}
