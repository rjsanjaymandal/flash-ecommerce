import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderConfirmation } from '@/lib/email/send-order-receipt'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
        console.error('RAZORPAY_WEBHOOK_SECRET is not set')
        return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // 1. Verify Signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    const { payload } = event

    console.log(`[Webhook] Received event: ${event.event}`, payload?.payment?.entity?.id)

    // 2. Handle 'order.paid' or 'payment.captured'
    if (event.event === 'order.paid' || event.event === 'payment.captured') {
        const payment = payload.payment.entity
        const orderId = payment.notes?.order_id || payload.order?.entity?.receipt 

        if (!orderId) {
             console.error('[Webhook] No Order ID found in payload notes or receipt')
             return NextResponse.json({ error: 'No order ID found' }, { status: 400 })
        }

        const supabase = createAdminClient()

        // 3. Process Payment (Idempotent RPC)
        const { data: result, error: rpcError } = await supabase.rpc('process_payment', {
            p_order_id: orderId,
            p_payment_id: payment.id
        })

        if (rpcError) {
             console.error('[Webhook] RPC Error:', rpcError)
             return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        if (result.success) {
             console.log(`[Webhook] Order ${orderId} marked as paid.`)
             
             // Send email if it wasn't already sent (RPC or logic dependent, 
             // but here we can try sending it again safe in knowledge resend might just duplicate 
             // or we can rely on verify route. For robustness, we check if we should send it.)
             // To avoid spam, we might check if 'notification' was just created? 
             // For now, let's rely on the RPC 'process_payment' to handle business logic updates 
             // but the email is outside RPC. 
             // We can fetch the order and check if we need to bug the user.
             // Ideally, email sending should be triggered by a DB trigger or a queue, but here:
             
             // We will attempt to send confirmation ONLY if this webhook call successfully changed the status
             // (i.e., 'Already processed' returns success=true but message='Already processed')
             
             if (result.message !== 'Already processed') {
                  const { data: orderDetails } = await supabase
                    .from('orders')
                    .select('*, order_items(*)')
                    .eq('id', orderId)
                    .single()

                  if (orderDetails) {
                       const email = orderDetails.user_email || (await supabase.from('profiles').select('email').eq('id', orderDetails.user_id).single()).data?.email
                       if (email) {
                           await sendOrderConfirmation({
                                email,
                                orderId,
                                customerName: orderDetails.shipping_name || 'Customer',
                                items: orderDetails.order_items.map((i: any) => ({
                                    name: i.name_snapshot,
                                    quantity: i.quantity,
                                    price: i.unit_price
                                })),
                                total: orderDetails.total
                           }).catch(console.error)
                       }
                  }
             }

        } else {
             console.warn(`[Webhook] Process payment returned failure for ${orderId}:`, result)
        }
    }

    return NextResponse.json({ status: 'ok' })

  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
