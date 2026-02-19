'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import { z } from 'zod'

const emailSchema = z.string().email()

export async function togglePreorder(productId: string, email?: string, guestId?: string) {
  const supabase = await createClient()

  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Determine Identifier & Validate
  const normalizedEmail = email?.trim().toLowerCase()

  if (!user) {
      if (!normalizedEmail && !guestId) {
        return { error: 'Please sign in or provide identifying information.' } // Should technically be unreachable if frontend generates guestId
      }
      
      if (normalizedEmail) {
          const result = emailSchema.safeParse(normalizedEmail)
          if (!result.success) {
              return { error: 'Please enter a valid email address.' }
          }
      }
  }

  // 3. Check for existing entry
  let query = supabase
    .from('preorders' as any)
    .select('id')
    .eq('product_id', productId)
  
  if (user) {
    query = query.eq('user_id', user.id)
  } else if (normalizedEmail) {
    query = query.eq('email', normalizedEmail)
  } else if (guestId) {
    query = query.eq('guest_id', guestId)
  }

  // Use maybeSingle() to avoid error if multiple rows exist (e.g. multiple emails for same guest device)
  const { data: existing }: { data: any } = await query.limit(1).maybeSingle()

  if (existing) {
    // Logic Split:
    // Auth User -> Toggle (Remove)
    // Guest (Email or Anonymous) -> Tell them they are already joined (Don't remove)
    
    if (user) {
        const { error: deleteError } = await supabase
            .from('preorders' as any)
            .delete()
            .eq('id', existing.id)

        if (deleteError) return { error: 'Failed to remove from waitlist.' }
        
        revalidatePath('/shop')
        revalidatePath(`/product/${productId}`)
        return { success: true, status: 'removed' }
    } else {
        // Guest: Return "already joined" status so UI can reflect it without removing the entry
        return { success: true, status: 'already_joined', message: "You are already on the waitlist!" }
    }
  } else {
    // Not in waitlist -> Add
    const payload: any = {
        product_id: productId,
    }

    if (user) {
        payload.user_id = user.id
    } else {
        // For non-logged in users, we can store both email and guest_id if available
        if (normalizedEmail) payload.email = normalizedEmail
        if (guestId) payload.guest_id = guestId
    }

    const { error: insertError } = await supabase
        .from('preorders' as any)
        .insert(payload)

    if (insertError) {
        console.error(insertError) // Debug
        if (insertError.message.includes('check_waitlist_identifier') || insertError.message.includes('check_user_or_email')) {
             return { error: 'System error: Missing identifier.' }
        }
        return { error: 'Failed to join waitlist. Please try again.' }
    }

    revalidatePath('/shop')
    revalidatePath(`/product/${productId}`)
    return { success: true, status: 'added' }
  }
}

export async function checkPreorderStatus(productId: string, email?: string, guestId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const normalizedEmail = email?.trim().toLowerCase()

    if (!user && !normalizedEmail && !guestId) return false

    let query = supabase
        .from('preorders' as any)
        .select('id')
        .eq('product_id', productId)

    if (user) {
        query = query.eq('user_id', user.id)
    } else if (normalizedEmail) {
        query = query.eq('email', normalizedEmail)
    } else if (guestId) {
        query = query.eq('guest_id', guestId)
    }

    // Use maybeSingle() to handle potential duplicates (e.g. multiple emails on same device) gracefully
    const { data } = await query.limit(1).maybeSingle()
    return !!data
}
