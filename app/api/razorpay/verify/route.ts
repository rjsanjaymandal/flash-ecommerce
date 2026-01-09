import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderConfirmation } from '@/lib/email/send-order-receipt'

export async function POST(req: Request) {
  try {
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    // 1. Verify Signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
        return NextResponse.json({ verified: false, error: 'Invalid signature' }, { status: 400 })
    }

    // 2. Initialize Service Role Client (Atomic Transaction)
    const supabase = createAdminClient()

    // 3. Call the Atomic RPC
    // This allows us to handle the DB update securely and atomically on the server
    console.log('[Verify] Verifying Payment via RPC:', { order_id, razorpay_payment_id })
    
    // NOTE: 'process_payment' is idempotent. It checks if order is already paid.
    const { data: result, error: rpcError } = await supabase.rpc('process_payment', {
        p_order_id: order_id,
        p_payment_id: razorpay_payment_id
    })

    if (rpcError) {
        console.error('[Verify] RPC Payment Error:', rpcError)
        return NextResponse.json({ 
            verified: false, 
            error: 'Failed to process payment data.',
            details: rpcError.message 
        }, { status: 500 })
    }

    if (!result.success) {
        // If it was already paid (e.g. by Webhook), we treat it as success for the UI
        if (result.message === 'Already processed') {
             console.log('[Verify] Order was already processed (likely via Webhook)')
             return NextResponse.json({ 
                verified: true, 
                message: 'Payment verified (previously processed)' 
            })
        }

        console.warn('[Verify] Payment logic failed:', result.error)
        return NextResponse.json({ 
            verified: false, 
            error: result.error || 'Payment processing failed in database.'
        }, { status: 400 })
    }

    // 4. Send Payment Confirmation Email (Fire-and-Forget)
    // Only send if we just successfully processed it (result.success is true and message is not 'Already processed')
    try {
        const { data: orderDetails } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', order_id)
            .single()

        if (orderDetails) {
             const email = orderDetails.user_email || (await supabase.from('profiles').select('email').eq('id', orderDetails.user_id).single()).data?.email
             
             if (email) {
                 sendOrderConfirmation({
                    email,
                    orderId: order_id,
                    customerName: orderDetails.shipping_name || 'Customer',
                    items: orderDetails.order_items.map((i: any) => ({
                        name: i.name_snapshot || 'Product',
                        quantity: i.quantity,
                        price: i.unit_price
                    })),
                    total: orderDetails.total
                 }).catch(err => console.error('[Verify] Background Email Error:', err));
             }
        }
    } catch (emailErr) {
        console.error('[Verify] Failed to initiate confirmation email:', emailErr)
    }

    return NextResponse.json({ 
        verified: true, 
        message: result.message || 'Payment successfully verified and processed' 
    })

  } catch (error) {
    console.error('[Verify] Error verifying Razorpay payment:', error)
    return NextResponse.json(
      { error: 'Error verifying payment' },
      { status: 500 }
    )
  }
}
