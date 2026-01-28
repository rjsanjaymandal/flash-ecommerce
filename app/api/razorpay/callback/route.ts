import { NextResponse } from 'next/server'
import { PaymentProcessor } from '@/lib/services/payment-processor'
import { SITE_URL } from '@/lib/constants'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    
    // Extract fields
    const orderId = formData.get('razorpay_order_id')?.toString()
    const paymentId = formData.get('razorpay_payment_id')?.toString()
    const signature = formData.get('razorpay_signature')?.toString()
    
    if (!orderId || !paymentId || !signature) {
        return NextResponse.redirect(new URL('/checkout?error=payment_failed', SITE_URL))
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
        console.error('[Callback] Missing Razorpay Secret')
        return NextResponse.redirect(new URL('/checkout?error=server_error', SITE_URL))
    }

    // 1. Verify Signature
    const body = orderId + '|' + paymentId
    const isValid = PaymentProcessor.verifySignature(
        body, 
        signature, 
        process.env.RAZORPAY_KEY_SECRET
    )

    if (!isValid) {
        console.error('[Callback] Invalid signature')
        return NextResponse.redirect(new URL('/checkout?error=invalid_signature', SITE_URL))
    }

    // 2. Fetch Internal Order ID
    const dbOrderId = await PaymentProcessor.getInternalOrderId(orderId)
    
    if (!dbOrderId) {
         console.error('[Callback] Failed to retrieve internal order ID')
         return NextResponse.redirect(new URL('/checkout?error=order_not_found', SITE_URL))
    }

    // 3. Process Payment
    const result = await PaymentProcessor.processPayment(dbOrderId, paymentId)

    if (!result.success) {
        console.warn('[Callback] Payment processing failed:', result.error)
        return NextResponse.redirect(new URL('/checkout?error=db_error', SITE_URL))
    }
    
    // Success
    return NextResponse.redirect(new URL(`/order/confirmation/${dbOrderId}`, SITE_URL))

  } catch (error) {
    console.error('[Callback] Critical Error:', error)
    return NextResponse.redirect(new URL('/checkout?error=server_error', SITE_URL))
  }
}
