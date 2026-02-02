'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/utils'

export type WaitlistSummary = {
  productId: string
  productName: string
  thumbnail: string
  waitlistCount: number
  lastActivity: string
}

export type WaitlistEntry = {
  userId: string
  email: string
  name: string
  joinedAt: string
}

// 1. Get High-Level Summary (Products with most waitlisters)
export async function getWaitlistSummary(page = 1, limit = 10) {
  await requireAdmin()
  const supabase = await createClient()

  // Using the scalable RPC
  const { data, error } = await supabase.rpc('get_waitlist_summary' as any, { 
    page, 
    page_limit: limit 
  })

  // Get total count for pagination
  // Get total count for pagination
  const { data: countData } = await supabase.rpc('get_waitlist_summary_count' as any)
  const total = countData ? Number(countData) : 0

  if (error) {
      console.error('Waitlist Summary Error:', error)
      return { data: [], meta: { total: 0, page, limit, totalPages: 0 } }
  }

  // Format matches RPC return
  const formatted = (data || []).map((p: any) => ({
      productId: p.product_id,
      productName: p.product_name,
      thumbnail: p.thumbnail,
      waitlistCount: Number(p.waitlist_count),
      lastActivity: p.last_activity
  }))

  return {
      data: formatted,
      meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
      }
  }
}

// 2. Get Emails for Export
export async function getWaitlistEmails(productId: string): Promise<WaitlistEntry[]> {
  await requireAdmin()
  const supabase = await createClient()
  
  // Join preorders -> profiles
  const { data, error } = await supabase
    .from('preorders')
    .select('created_at, user_id, profiles(email, name)')
    .eq('product_id', productId)
    .order('created_at', { ascending: true })
    
  if (error) throw error
  
  return (data || []).map((row: any) => ({
      userId: row.user_id,
      email: row.profiles?.email || 'No Email',
      name: row.profiles?.name || 'Unknown',
      joinedAt: row.created_at
  }))
}
