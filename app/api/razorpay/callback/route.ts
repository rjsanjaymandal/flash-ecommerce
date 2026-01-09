import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    // Razorpay sends data as form-data/urlencoded on callback
    const formData = await req.formData()
    
    // Extract fields
    const orderId = formData.get('razorpay_order_id')?.toString()
    const paymentId = formData.get('razorpay_payment_id')?.toString()
    const signature = formData.get('razorpay_signature')?.toString()
    
    // Check if we have necessary params
    if (!orderId || !paymentId || !signature) {
        console.error('[Callback] Missing parameters in callback')
        // Redirect to checkout with error
        return NextResponse.redirect(new URL('/checkout?error=payment_failed', req.url))
    }

    // 1. Verify Signature
    // Signature = hmac_sha256(order_id + "|" + payment_id, secret)
    const body = orderId + '|' + paymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature !== signature) {
        console.error('[Callback] Invalid signature')
        return NextResponse.redirect(new URL('/checkout?error=invalid_signature', req.url))
    }

    // 2. Process Payment via RPC (Atomic)
    const supabase = createAdminClient()
    
    // Retrieve our internal Order ID using the Razorpay Order ID (stored in notes or mapped)
    // Actually, we pass the internal order UUID as the Receipt in Razorpay Order creation.
    // BUT Razorpay callback only sends `razorpay_order_id`. 
    // We need to find our DB order that matches this `razorpay_order_id`?
    // Wait, in `app/api/razorpay/order/route.ts`, we didn't save the `razorpay_order_id` to our DB.
    // We only returned it to the client.
    
    // However, the `order` table might not have `razorpay_order_id` column to lookup.
    // CHECK DB SCHEMA?
    // Actually `process_payment` RPC takes `p_order_id`. 
    // The `orderId` variable here is the RAZORPAY ID (e.g. `order_EKwx...`), NOT our UUID.
    
    // PROBLEM: We need to map Razorpay Order ID -> DB Order UUID.
    // OPTION A: We saved it in `orders` table?
    // OPTION B: Razorpay sends back `notes` in the callback? 
    // According to docs, `callback` POST body includes `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`.
    // It DOES NOT guarantee `notes` are in the body for standard standard checkout callback.
    
    // SOLUTION: Use the Razorpay API to fetch the order details using the ID, which WILL contain our notes (UUID).
    // OR: Query our DB to find the order if we saved the Razorpay Order ID.
    
    // Let's assume we didn't save `razorpay_order_id`.
    // Let's check `api/razorpay/order/route.ts`...
    // It creates the order and returns it. It DOES NOT update the DB with the razorpay_order_id.
    
    // This is a gap. 
    // Quick Fix: We should update the DB with the Razorpay Order ID when we generate it. 
    // BUT we are in the callback route now.
    
    // Does Razorpay Send Notes?
    // The standard form post usually does NOT contain notes fields directly.
    
    // ALTERNATIVE: 
    // 1. Fetch the Order from Razorpay by ID to get the Notes.
    // 2. Use the UUID from the notes.
    
    // Let's try fetching from Razorpay API.
    
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    
    // Basic Auth
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
    
    const rzpOrderRes = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
        headers: {
            'Authorization': `Basic ${auth}`
        }
    })
    
    if (!rzpOrderRes.ok) {
        console.error('[Callback] Failed to fetch Razorpay order details')
        return NextResponse.redirect(new URL('/checkout?error=verification_failed', req.url))
    }
    
    const rzpOrderData = await rzpOrderRes.json()
    const internalOrderId = rzpOrderData.notes?.order_id
    
    if (!internalOrderId) {
         console.error('[Callback] No internal order ID in Razorpay notes')
         // Fallback? If receipt was UUID?
         // In `order/route.ts`: receipt: order_id (UUID)
         // So `rzpOrderData.receipt` should be our UUID.
         // Let's use that as fallback.
    }
    
    const dbOrderId = internalOrderId || rzpOrderData.receipt
    
    if (!dbOrderId) {
         return NextResponse.redirect(new URL('/checkout?error=order_not_found', req.url))
    }

    const { data: result, error: rpcError } = await supabase.rpc('process_payment', {
        p_order_id: dbOrderId,
        p_payment_id: paymentId
    })

    if (rpcError) {
        console.error('[Callback] RPC Error:', rpcError)
        return NextResponse.redirect(new URL('/checkout?error=db_error', req.url))
    }
    
    // Success! Redirect to confirmation
    return NextResponse.redirect(new URL(`/order/confirmation/${dbOrderId}`, req.url))

  } catch (error) {
    console.error('[Callback] Error:', error)
    return NextResponse.redirect(new URL('/checkout?error=server_error', req.url))
  }
}
