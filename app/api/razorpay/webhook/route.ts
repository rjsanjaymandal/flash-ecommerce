import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend } from '@/lib/email/client'
import { OrderConfirmationEmail } from '@/lib/email/templates/order-confirmation'

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

        // 1. Handle Paid Event
        if (event.event === 'order.paid') {
            const paymentId = payload.payment.entity.id
            const orderUuid = payload.order.entity.receipt // We now pass full UUID as receipt

            console.log(`Webhook: Processing paid order ${orderUuid}`)

            if (orderUuid) {
                const supabase = createAdminClient()
                
                // Call Atomic RPC
                const { data: result, error: rpcError } = await supabase.rpc('process_payment', {
                    p_order_id: orderUuid,
                    p_payment_id: paymentId
                })

                if (rpcError) {
                    console.error('Webhook RPC Error:', rpcError)
                    // We return 500 so Razorpay retries the webhook
                    return NextResponse.json({ error: rpcError.message }, { status: 500 })
                }

                if (!result.success) {
                    console.warn('Webhook Payment Logic Failed:', result.error)
                    // If it's a logical failure (e.g. stock missing) we might keep it 200 to stop retries 
                    // OR 400 to signal error. Usually 200 if we want to handle manually and stop retries.
                    return NextResponse.json({ error: result.error }, { status: 200 })
                }

                // Send email ONLY if this was the first time processing (not idempotent skip)
                if (result.success && result.message !== 'Already processed') {
                     try {
                        const { data: orderDetails } = await supabase
                            .from('orders')
                            .select('*, order_items(*)')
                            .eq('id', orderUuid)
                            .single()

                        if (orderDetails?.user_email || orderDetails?.user_id) {
                            const email = orderDetails.user_email || (await supabase.from('profiles').select('email').eq('id', orderDetails.user_id).single()).data?.email
                            
                            if (email) {
                                await resend.emails.send({
                                    from: 'Flash <orders@flashhfashion.in>',
                                    to: email,
                                    subject: `Payment Confirmed - Order #${orderUuid.slice(0, 8).toUpperCase()}`,
                                    react: OrderConfirmationEmail({
                                        orderId: orderUuid,
                                        customerName: orderDetails.shipping_name || 'Customer',
                                        items: orderDetails.order_items.map((i: any) => ({
                                            name: i.name_snapshot || 'Product',
                                            quantity: i.quantity,
                                            price: i.unit_price
                                        })),
                                        total: orderDetails.total
                                    })
                                })
                            }
                        }
                    } catch (emailErr) {
                        console.error('Webhook: Failed to send confirmation email:', emailErr)
                    }
                }

                console.log(`Webhook: Successfully processed order ${orderUuid}`)
            } else {
                 console.warn('Webhook: No receipt (order UUID) found in payload')
            }

        } else if (event.event === 'payment.failed') {
             const orderUuid = payload.order.entity.receipt || payload.payment.entity.notes?.order_id
             if (orderUuid) {
                 console.log(`Webhook: Payment failed for order ${orderUuid}`)
                 // Could mark as 'cancelled' here if desired, or just leave 'pending' for retry
             }
        }

        return NextResponse.json({ status: 'ok' })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('Webhook Error:', error)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
