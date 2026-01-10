import { NextResponse } from 'next/server'
import { PaymentProcessor } from '@/lib/services/payment-processor'

export async function POST(req: Request) {
  try {
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    // 1. Verify Signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const isValid = PaymentProcessor.verifySignature(
        body, 
        razorpay_signature, 
        process.env.RAZORPAY_KEY_SECRET!
    )

    if (!isValid) {
        return NextResponse.json({ verified: false, error: 'Invalid signature' }, { status: 400 })
    }

    // 2. Process Payment (Atomic)
    console.log('[Verify] Verifying Payment:', { order_id, razorpay_payment_id })
    const result = await PaymentProcessor.processPayment(order_id, razorpay_payment_id)

    if (!result.success) {
        console.warn('[Verify] Payment processing failed:', result.error)
        return NextResponse.json({ verified: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({ 
        verified: true, 
        message: result.message 
    })

  } catch (error) {
    console.error('[Verify] Error verifying Razorpay payment:', error)
    return NextResponse.json(
      { error: 'Error verifying payment' },
      { status: 500 }
    )
  }
}
