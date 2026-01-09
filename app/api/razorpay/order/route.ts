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

  // Use Service Role to allow fetching any order by ID (safe since we only need total)
  // Or use standard client if we trust the user is logged in/owns the order.
  // Standard client is better for RLS security, but if checkout is guest, we need to be careful.
  // Assuming 'createClient' handles cookie auth.
  // Use Service Role to allow guest checkout (fetching orders without user_id session match)
  const supabase = createAdminClient()

  try {
    const { order_id } = await req.json()

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
        .select('total, status, id') // Removed currency as it doesn't exist
        .eq('id', order_id)
        .single()
    
    if (error || !order) {
        console.error('Order fetch failed:', error)
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 2. Security Check: Ensure order is not already paid
    if (order.status === 'paid') {
        return NextResponse.json({ error: 'Order is already paid' }, { status: 400 })
    }

    // 3. STRICT GUARD: Validate Product Availability & Status
    // Fetch order items and their related products to ensure they are still active and (optional) in stock.
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
    const invalidItem = orderItems.find((item: { product: { is_active: boolean; name: string } | null }) => {
        // Product explicitly deleted (null) or set to inactive
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

    // 3. Create Razorpay Order with DB Amount
    const options = {
      amount: Math.round(order.total * 100), // Convert to paisa
      currency: 'INR',
      receipt: order_id, // Use full UUID for reliable matching
      notes: {
          order_id: order_id
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
