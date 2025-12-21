import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createAdminClient } from '@/lib/supabase/admin'

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

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    // 3. Create Razorpay Order with DB Amount
    const options = {
      amount: Math.round(order.total * 100), // Convert to paisa
      currency: 'INR',
      receipt: `rcpt_${order_id.slice(0, 8)}`,
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
