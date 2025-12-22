'use server'

import { createClient } from '@/lib/supabase/server'
import { resend } from '@/lib/email/client'
import { WaitlistNotification } from '@/components/emails/waitlist-notification'
import { render } from '@react-email/components'

export async function notifyWaitlistUser(preorderId: string) {
    const supabase = await createClient()

    // 1. Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 2. Fetch Preorder Details with Stock and Status
    const { data: preorder, error } = await supabase
        .from('preorders')
        .select(`
            id,
            email,
            user_name,
            notified_at,
            products (
                name,
                slug,
                main_image_url,
                product_stock (quantity)
            )
        `)
        .eq('id', preorderId)
        .single()

    if (error || !preorder) return { error: 'Request not found' }

    // 3. Enterprise Logic Checks
    
    // Check 1: Idempotency (Don't spam)
    if (preorder.notified_at) {
        return { error: 'User already notified', status: 'skipped' }
    }

    // Check 2: Stock Validation (Don't promise ghost stock)
    const totalStock = preorder.products?.product_stock?.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0) || 0
    if (totalStock <= 0) {
        return { error: 'Product is still Out of Stock. Cannot notify.' }
    }

    const productName = preorder.products?.name || 'Product'
    const productUrl = `${process.env.NEXT_PUBLIC_APP_URL}/product/${preorder.products?.slug}`
    const imageUrl = preorder.products?.main_image_url
    const userName = preorder.user_name || 'Customer'
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''

    // 4. Send Email
    let success = false
    if (process.env.RESEND_API_KEY) {
        try {
            const emailHtml = await render(
                WaitlistNotification({
                    productName,
                    productUrl,
                    imageUrl,
                    userName,
                    baseUrl
                })
            )

            await resend.emails.send({
                from: 'Flash Store <onboarding@resend.dev>',
                to: preorder.email,
                subject: `Good News! ${productName} is back in stock`,
                html: emailHtml
            })
            success = true
        } catch (err) {
            console.error(err)
            return { error: 'Failed to send email' }
        }
    } else {
        // Simulation
        console.log(`[SIMULATION] Enterprise Waitlist Email sent to ${preorder.email}`)
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300))
        success = true
    }

    // 5. Update Status (Tracking)
    if (success) {
        await supabase
            .from('preorders')
            .update({ notified_at: new Date().toISOString() })
            .eq('id', preorderId)
    }

    return { success: true, simulated: !process.env.RESEND_API_KEY }
}

export async function notifyAllWaitlist(productId: string) {
    const supabase = await createClient()

    // 1. Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 2. Get Candidates (Notified_at IS NULL)
    const { data: candidates, error } = await supabase
        .from('preorders')
        .select('id')
        .eq('product_id', productId)
        .is('notified_at', null)

    if (error) return { error: 'Failed to fetch candidates' }
    if (!candidates || candidates.length === 0) return { message: 'No pending notifications' }

    // 3. Process in Batches
    const BATCH_SIZE = 20
    let processed = 0
    let skipped = 0
    let failed = 0

    // Split candidates into chunks
    for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
        const batch = candidates.slice(i, i + BATCH_SIZE)
        
        // Process this batch in parallel
        const results = await Promise.all(batch.map(c => notifyWaitlistUser(c.id)))

        // Tally results
        results.forEach(r => {
            if (r.success) processed++
            else if (r.status === 'skipped') skipped++
            else failed++
        })

        // Optional: Add a small delay between batches to be nice to APIs (if list is huge)
        if (i + BATCH_SIZE < candidates.length) {
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    }

    return { 
        success: true, 
        stats: { 
            processed, 
            skipped, 
            failed,
            total_candidates: candidates.length
        } 
    }
}
