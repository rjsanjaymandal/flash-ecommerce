import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/rate-limit'

// Initialize inside handler or use a safe check if global
// But simpler to just initialize it inside to avoid build errors if env vars missing
export async function POST(req: Request) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay keys missing')
      return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 })
  }

  // Use Admin Client to fetch order details (Static client can't see new orders due to RLS)
  const supabase = createAdminClient()

  try {
    const { order_id, isPartialCod } = await req.json()

    if (!order_id) {
        return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Rate Limit: 10 attempts per minute per order
    const rateLimit = await checkRateLimit(`rzp_order:${order_id}`, 10, 60)
    if (!rateLimit.success) {
        return NextResponse.json({ error: 'Too many payment attempts. Please wait.' }, { status: 429 })
    }

    // 1. Fetch Order directly from DB
    const { data: order, error } = await supabase
        .from('orders')
        .select('total, status, id')
        .eq('id', order_id)
        .single()
    
    if (error || !order) {
        console.error('Order fetch failed:', error)
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 2. Security Check: Ensure order is not already paid
    if (order.status === 'paid' || order.status === 'confirmed_partial') {
        return NextResponse.json({ error: 'Order is already processed' }, { status: 400 })
    }

    // 3. STRICT GUARD: Validate Product Availability & Status
    const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
            *,
            product:products (
                id,
                name,
                is_active
            )
        `)
        .eq('order_id', order_id)
    
    if (itemsError || !orderItems || orderItems.length === 0) {
        console.error('Failed to validate order items:', itemsError)
        return NextResponse.json({ error: 'Could not validate order items.' }, { status: 500 })
    }

    // Check for any invalid product
    const invalidItem = orderItems.find((item: any) => {
        if (!item.product) return true 
        if (item.product.is_active === false) return true
        return false
    })

    if (invalidItem) {
        const name = invalidItem.product?.name || 'A product in your cart'
        console.warn(`Blocked payment for invalid item: ${name}`)
        return NextResponse.json({ 
            error: `${name} is no longer available. Please update your cart.` 
        }, { status: 400 })
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    // 4. Dynamic Amount Logic: Partial COD (₹100) vs Full PREPAID
    // Security: Hardcode ₹100 for Partial COD to prevent tampering
    const finalAmount = isPartialCod ? 10000 : Math.round(order.total * 100)

    // 5. Create Razorpay Order with DB Amount
    const options = {
      amount: finalAmount, 
      currency: 'INR',
      receipt: order_id, 
      notes: {
          order_id: order_id,
          payment_type: isPartialCod ? 'PARTIAL_COD' : 'PREPAID'
      }
    }

    const rzpOrder = await razorpay.orders.create(options)

    return NextResponse.json(rzpOrder)
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return NextResponse.json(
      { error: 'Error creating payment order' },
      { status: 500 }
    )
  }
}
