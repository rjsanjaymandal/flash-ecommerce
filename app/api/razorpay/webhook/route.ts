import { NextResponse } from 'next/server'
import { PaymentProcessor } from '@/lib/services/payment-processor'
import { NotificationService } from '@/lib/services/notification-service'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!process.env.RAZORPAY_WEBHOOK_SECRET || !signature) {
        return NextResponse.json({ error: 'Configuration check failed' }, { status: 400 })
    }

    // 1. Verify Signature
    const isValid = PaymentProcessor.verifySignature(
        body, 
        signature, 
        process.env.RAZORPAY_WEBHOOK_SECRET
    )

    if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    const { payload } = event
    const eventId = event.id

    console.log(`[Webhook] Received event: ${event.event}`, eventId)
    
    const supabase = createAdminClientAdmin() // Helper or just use createAdminClient()

    // 2. Ledger: Idempotency Check & Persistence
    // storing raw event first
    const { data: existingEvent } = await supabase
        .from('webhook_events')
        .select('*')
        .eq('event_id', eventId)
        .single()
    
    if (existingEvent && existingEvent.processed) {
        console.log(`[Webhook] Event ${eventId} already processed. Skipping.`)
        return NextResponse.json({ status: 'ok', message: 'Already processed' })
    }

    // Insert/Log event if new
    if (!existingEvent) {
        await supabase.from('webhook_events').insert({
            event_id: eventId,
            event_type: event.event,
            payload: event
        })
    }

    // 3. Handle 'order.paid' or 'payment.captured'
    if (event.event === 'order.paid' || event.event === 'payment.captured') {
        const payment = payload.payment.entity
        const orderId = payment.notes?.order_id || payload.order?.entity?.receipt 

        if (!orderId) {
             console.error('[Webhook] No Order ID found')
             await supabase.from('webhook_events').update({ processing_error: 'No Order ID found' }).eq('event_id', eventId)
             return NextResponse.json({ error: 'No order ID found' }, { status: 400 })
        }

        // 4. Process Payment using Shared Service
        const result = await PaymentProcessor.processPayment(orderId, payment.id)

        if (!result.success && result.message !== 'Payment verified (previously processed)') {
             console.warn(`[Webhook] Processing failed for ${orderId}:`, result.error)
             await supabase.from('webhook_events').update({ processing_error: result.error }).eq('event_id', eventId)
             return NextResponse.json({ error: result.error }, { status: 500 })
        }
        
        // 5. Success! Notify Admins
        const amount = (payment.amount / 100).toFixed(2); // Convert paise to currency
        await NotificationService.notifyAdmins(
            "New Order Recieved! 💰",
            `Order ${orderId.slice(0, 8)} paid successfully. Amount: ₹${amount}`,
            "success",
            `/admin/orders/${orderId}`
        );
        
        // 6. Mark Ledger as Processed
        await supabase.from('webhook_events').update({ processed: true, processing_error: null }).eq('event_id', eventId)
        console.log(`[Webhook] Successfully processed ${orderId}`)
    }

    return NextResponse.json({ status: 'ok' })

  } catch (error: any) {
    console.error('[Webhook] Error processing webhook:', error)
    // We don't have eventId here easily unless we parse earlier. 
    // Ideally wrap only logic inside try/catch.
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Helper to avoid import conflicts if any
function createAdminClientAdmin() {
    // ... logic or import
    return require('@/lib/supabase/admin').createAdminClient()
}

