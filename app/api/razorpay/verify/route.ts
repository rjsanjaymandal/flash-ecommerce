import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export async function POST(req: Request) {
  try {
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    // 1. Verify Signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')

    const isAuthentic = expectedSignature === razorpay_signature

    if (!isAuthentic) {
        return NextResponse.json({ verified: false, error: 'Invalid signature' }, { status: 400 })
    }

    // 2. Initialize Service Role Client
    // This bypasses RLS, which is required for updating order status and awarding points securely.
    const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 3. Idempotency Check & Fetch Order
    const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('id, user_id, total, status')
        .eq('id', order_id)
        .single()
    
    if (fetchError || !order) {
        return NextResponse.json({ verified: false, error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'paid') {
        // Already processed
        return NextResponse.json({ verified: true, message: 'Already processed' })
    }

    // 4. Update Order Status
    const { error: orderError } = await supabase
        .from('orders')
        .update({ 
            status: 'paid', 
            payment_provider: 'razorpay', 
            payment_reference: razorpay_payment_id 
        })
        .eq('id', order_id)
    
    if (orderError) {
        console.error('Error updating order:', orderError)
        return NextResponse.json({ verified: false, error: 'Failed to update order status' }, { status: 500 })
    }

    // 5. Award Points
    if (order.user_id) {
        try {
            const pointsEarned = Math.floor(Number(order.total) / 100) // 1 point per 100 currency units
            if (pointsEarned > 0) {
                // We use an RPC if available, or sequential update. 
                // Using sequential update with Service Role is safe enough here.
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('loyalty_points')
                    .eq('id', order.user_id)
                    .single()
                
                const newPoints = (profile?.loyalty_points || 0) + pointsEarned
                
                await supabase
                    .from('profiles')
                    .update({ loyalty_points: newPoints })
                    .eq('id', order.user_id)
            }
        } catch (pointError) {
            console.error('Failed to award points (non-critical):', pointError)
            // Do not fail the verification response, just log it.
        }
    }

    return NextResponse.json({ verified: true })

  } catch (error) {
    console.error('Error verifying Razorpay payment:', error)
    return NextResponse.json(
      { error: 'Error verifying payment' },
      { status: 500 }
    )
  }
}
