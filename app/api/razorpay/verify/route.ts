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
    const { data: result, error: rpcError } = await supabase.rpc('process_payment', {
        p_order_id: order_id,
        p_payment_id: razorpay_payment_id
    })

    if (rpcError) {
        console.error('RPC Payment Error:', rpcError)
        return NextResponse.json({ 
            verified: false, 
            error: 'Failed to process payment data.',
            details: rpcError.message 
        }, { status: 500 })
    }

    if (!result.success) {
        console.warn('Payment logic failed:', result.error)
        return NextResponse.json({ 
            verified: false, 
            error: result.error || 'Payment processing failed in database.'
        }, { status: 400 })
    }

    // 4. Send Payment Confirmation Email (Fire-and-Forget)
    try {
        const { data: orderDetails } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', order_id)
            .single()

        if (orderDetails?.user_email || orderDetails?.user_id) {
             const email = orderDetails.user_email || (await supabase.from('profiles').select('email').eq('id', orderDetails.user_id).single()).data?.email
             
             if (email) {
                 // FIRE AND FORGET - Do not await
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
                 }).catch(err => console.error('Background Email Error:', err));
             }
        }
    } catch (emailErr) {
        console.error('Failed to initiate confirmation email:', emailErr)
    }

    return NextResponse.json({ 
        verified: true, 
        message: result.message || 'Payment successfully verified and processed' 
    })

  } catch (error) {
    console.error('Error verifying Razorpay payment:', error)
    return NextResponse.json(
      { error: 'Error verifying payment' },
      { status: 500 }
    )
  }
}
