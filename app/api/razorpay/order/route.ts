import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

// Initialize inside handler or use a safe check if global
// But simpler to just initialize it inside to avoid build errors if env vars missing
export async function POST(req: Request) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay keys missing')
      return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 })
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })

  try {
    const { amount, currency = 'INR' } = await req.json()

    // Create an order on Razorpay
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paisa
      currency,
      receipt: `receipt_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return NextResponse.json(
      { error: 'Error creating order' },
      { status: 500 }
    )
  }
}
