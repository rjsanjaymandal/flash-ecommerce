'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function togglePreorder(productId: string) {
  const supabase = await createClient()

  // 1. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'You must be logged in to join the waitlist.' }
  }

  // 2. Check if already pre-ordered
  const { data: existing } = await supabase
    .from('preorders' as any)
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    // Optional: Remove from waitlist if clicked again? 
    // For now, let's assume it's a toggle.
    const { error: deleteError } = await supabase
        .from('preorders' as any)
        .delete()
        .eq('id', (existing as any).id)

    if (deleteError) return { error: 'Failed to remove from waitlist.' }
    
    revalidatePath('/shop')
    revalidatePath(`/product/${productId}`) // We might not have the slug here easily, but path revalidation is good practice
    return { success: true, status: 'removed' }
  } else {
    // 3. Add to waitlist
    const { error: insertError } = await supabase
        .from('preorders' as any)
        .insert({
            product_id: productId,
            user_id: user.id
        })

    if (insertError) return { error: 'Failed to join waitlist. Please try again.' }

    revalidatePath('/shop')
    revalidatePath(`/product/${productId}`)
    return { success: true, status: 'added' }
  }
}

export async function checkPreorderStatus(productId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false

    const { data } = await supabase
        .from('preorders' as any)
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single()
    
    return !!data
}
