import { NextResponse } from 'next/server'
import { PaymentProcessor } from '@/lib/services/payment-processor'
import { NotificationService } from '@/lib/services/notification-service'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!process.env.RAZORPAY_WEBHOOK_SECRET || !signature || process.env.RAZORPAY_WEBHOOK_SECRET === 'your_webhook_secret_here') {
        console.error('[Webhook] FATAL: RAZORPAY_WEBHOOK_SECRET is missing or using placeholder.')
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
    
    const supabase = createAdminClient()

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

        if (!result.success) {
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

    // 4. Handle 'payment.failed'
    if (event.event === 'payment.failed') {
        const payment = payload.payment.entity
        const orderId = payment.notes?.order_id || payload.order?.entity?.receipt 

        console.warn(`[Webhook] Payment Failed for Order ${orderId}: ${payment.error_description}`)
        
        await supabase.from('system_logs').insert({
            severity: 'WARN',
            component: 'WEBHOOK_PAYMENT_FAILED',
            message: `Payment Failed for Order ${orderId}: ${payment.error_description}`,
            metadata: { 
                orderId, 
                paymentId: payment.id, 
                error: payment.error_code,
                reason: payment.error_description 
            }
        })

        await supabase.from('webhook_events').update({ processed: true, processing_error: payment.error_description }).eq('event_id', eventId)
    }

    return NextResponse.json({ status: 'ok' })

  } catch (error: unknown) {
    console.error('[Webhook] Error processing webhook:', error)
    // We don't have eventId here easily unless we parse earlier. 
    // Ideally wrap only logic inside try/catch.
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}



