import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export async function POST(req: Request) {
    try {
        const body = await req.text()
        const headersList = await headers()
        const signature = headersList.get('x-razorpay-signature')

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
        }

        const secret = process.env.RAZORPAY_WEBHOOK_SECRET
        if (!secret) {
            console.error('RAZORPAY_WEBHOOK_SECRET is not set')
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        // Verify Signature
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex')

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        const event = JSON.parse(body)
        const { payload } = event

        // Initialize Admin Client (Service Role)
        const supabase = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        if (event.event === 'order.paid') {
            const razorpayOrderId = payload.order.entity.id
            const paymentId = payload.payment.entity.id
            // const amount = payload.payment.entity.amount 

            // Find order by Razorpay Order ID (stored in payment_reference or id? 
            // NOTE: In our verify logic, we used order.id as the razorpay receipt or similar? 
            // A common pattern is storing the razorpay_order_id in a column or in metadata.
            // Let's check our schema. 'orders' has 'payment_reference'. 
            // Usually 'payment_reference' stores the Payment ID. 
            // We need to find the order that corresponds to this Razorpay Order.
            // If we stored razorpay_order_id in the order table (which we don't seem to have explicitly in the schema shown earlier, 
            // except maybe 'payment_reference' was used loosely?).
            // Wait, looking at verify route: 
            // `const { order_id, razorpay_order_id ... } = req.json()`
            // It selects order by `id` (UUID). 
            // The webhook gives us `razorpay_order_id`. We need to match.
            // If we don't have a column for razorpay_order_id, we might have trouble finding the order *unless* we stored the UUID in Razorpay's notes.
            
            // HYPOTHESIS: We need to search by something we stored. 
            // Attempt 1: Search by payment_reference if we stored it prematurely? No.
            // Attempt 2: Do we have razorpay_order_id column? Schema said `payment_reference`.
            // Let's assume we need to update the schema OR assume 'payment_reference' might hold it?
            // Actually, best practice: Store app's specific Order UUID in Razorpay Order's generic 'receipt' field.
            
            const receipt = payload.order.entity.receipt // This should be our Order UUID
            
            if (receipt) {
                const { error: updateError } = await supabase
                    .from('orders')
                    .update({
                        status: 'paid',
                        payment_provider: 'razorpay',
                        payment_reference: paymentId // Store the successful Payment ID
                    })
                    .eq('id', receipt) // receipt is our UUID
                    .eq('status', 'pending') // Idempotency: only update if pending
                
                if (updateError) console.error('Webhook: Failed to update order', updateError)
                else console.log(`Webhook: Order ${receipt} marked paid`)
                
                // NOTE: Loyalty points are awarded by the client-side 'verify' call for immediate user feedback.
                // We rely on the database constraints (idempotency) or a separate 'award_points' RPC to prevent double-crediting if we were to add it here.
                // For now, this webhook ensures the order status is ultimately consistent (PAID) even if the client disconnects.
            } else {
                 console.warn('Webhook: No receipt found in payload to match order')
            }

        } else if (event.event === 'payment.failed') {
             // Handle failure logic if needed, e.g. notify user
             const receipt = payload.payment.entity.notes?.order_id || payload.order.entity.receipt
             if (receipt) {
                 console.log(`Webhook: Payment failed for ${receipt}`)
                 // Optional: Mark as cancelled or keep pending retry
             }
        }

        return NextResponse.json({ status: 'ok' })
    } catch (error: any) {
        console.error('Webhook Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
