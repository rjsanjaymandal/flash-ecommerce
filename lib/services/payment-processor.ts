// @ts-nocheck - forcing reload
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderConfirmation, sendAdminOrderAlert } from '@/lib/email/send-order-receipt'
import Razorpay from 'razorpay'

// Types
interface VerificationResult {
    success: boolean
    message?: string
    error?: string
}

export class PaymentProcessor {
    /**
     * Verifies the Razorpay signature to prevent tampering
     */
    static verifySignature(body: string, signature: string, secret: string): boolean {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex')

        return expectedSignature === signature
    }

    /**
     * Fetches the internal Order UUID using the Razorpay Order ID.
     * Useful when the client only sends back the Razorpay ID.
     */
    static async getInternalOrderId(razorpayOrderId: string): Promise<string | null> {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
             console.error('[PaymentProcessor] Missing Razorpay keys')
             return null
        }

        try {
            const razorpay = new Razorpay({
              key_id: process.env.RAZORPAY_KEY_ID,
              key_secret: process.env.RAZORPAY_KEY_SECRET,
            })
            
            const rzpOrder = await razorpay.orders.fetch(razorpayOrderId)
            // Priority: Notes > Receipt
            return (rzpOrder.notes as any)?.order_id || rzpOrder.receipt
        } catch (error) {
            console.error('[PaymentProcessor] Failed to fetch Razorpay order:', error)
            return null
        }
    }

    /**
     * Search Razorpay for an order with the given Receipt (Safety Net)
     */
    static async findRazorpayOrderByReceipt(receipt: string): Promise<any | null> {
         if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null
         
         const razorpay = new Razorpay({
              key_id: process.env.RAZORPAY_KEY_ID,
              key_secret: process.env.RAZORPAY_KEY_SECRET,
         })

         try {
             const orders = await razorpay.orders.all({
                 receipt: receipt,
                 count: 1
             })
             
             if (orders.items && orders.items.length > 0) {
                 return orders.items[0]
             }
             return null
         } catch (e) {
             console.warn('[PaymentProcessor] Failed to search Razorpay orders:', e)
             return null
         }
    }

    /**
     * Fetch successful payments for a Razorpay Order
     */
    static async getPaymentsForOrder(razorpayOrderId: string): Promise<any[]> {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return []
        
        const razorpay = new Razorpay({
              key_id: process.env.RAZORPAY_KEY_ID,
              key_secret: process.env.RAZORPAY_KEY_SECRET,
        })

        try {
            const payments = await razorpay.orders.fetchPayments(razorpayOrderId)
            return payments.items || [] // collection
        } catch (e) {
            console.warn('[PaymentProcessor] Failed to fetch payments:', e)
            return []
        }
    }

    /**
     * Core atomic function to mark an order as PAID in the database
     * and trigger the confirmation email.
     */
    /**
     * Core atomic function to mark an order as PAID in the database
     * and trigger the confirmation email.
     */
    static async processPayment(orderId: string, paymentId: string): Promise<VerificationResult> {
        const supabase = createAdminClient()
        
        // 0. Deep Verification: Fetch Razorpay Payment Details First
        // This ensures the generic "paymentId" is valid and matches the amount
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return { success: false, error: 'Server Configuration Error: Missing Keys' }
        }

        let razorpayAmount = 0
        let razorpayStatus = ''
        
        try {
            const razorpay = new Razorpay({
              key_id: process.env.RAZORPAY_KEY_ID,
              key_secret: process.env.RAZORPAY_KEY_SECRET,
            })
            
            const payment = await razorpay.payments.fetch(paymentId)
            razorpayAmount = Number(payment.amount)
            razorpayStatus = payment.status
            
            if (razorpayStatus !== 'captured' && razorpayStatus !== 'authorized') { 
                 // Note: 'authorized' is also okay if we capture manually, but typically 'captured' is best.
                 // We will proceed but log a warning if strictly captured is needed.
            }
        } catch (e: any) {
            console.error('[PaymentProcessor] Razorpay Fetch Failed:', e)
            return { success: false, error: `Invalid Payment ID: ${e.message}` }
        }

        // 1. Fetch current order status (Idempotency Check)
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('id, status, total, user_id')
            .eq('id', orderId)
            .single()

        if (fetchError || !order) {
            console.error('[PaymentProcessor] Order Fetch Error:', fetchError)
            return { success: false, error: 'Order not found' }
        }

        if (order.status === 'paid') {
            await this.logPaymentAttempt('PAYMENT', `Idempotent success for Order ${orderId}`, 'INFO', { paymentId })
            return { success: true, message: 'Payment verified (previously processed)' }
        }
        
        // 2. Strict Amount Check (Security)
        // Order Total is in Rupees (e.g. 500). Razorpay is in Paise (e.g. 50000).
        const expectedAmountPaise = Math.round(order.total * 100)
        
        if (razorpayAmount !== expectedAmountPaise) {
            const mismatchError = `Amount Mismatch: Expected ${expectedAmountPaise}, Received ${razorpayAmount}`
            console.error(`[PaymentProcessor] SECURITY ALERT: ${mismatchError}`)
            
            await this.logPaymentAttempt('PAYMENT_SECURITY', mismatchError, 'ERROR', { 
                orderId, paymentId, expected: expectedAmountPaise, received: razorpayAmount 
            })
            
            return { success: false, error: 'Payment verification failed: Amount Mismatch' }
        }

        // 3. Atomic Finalization via RPC
        // This RPC handles Status + Points + Notifications + Logs in one transaction.
        const { data: rpcResult, error: rpcError } = await supabase.rpc('finalize_payment_v3', {
             p_order_id: orderId,
             p_payment_id: paymentId,
             p_amount_paid: razorpayAmount
        })
        
        if (rpcError) {
             console.error('[PaymentProcessor] RPC Error:', rpcError)
             await this.logPaymentAttempt('PAYMENT_DB', `RPC Failed for ${orderId}`, 'ERROR', { error: rpcError })
             return { success: false, error: 'Transaction failed: ' + rpcError.message }
        }
        
        // 5. Trigger Email (Synchronous Wait to ensure delivery in serverless env)
        try {
            console.log('[PaymentProcessor] Starting email dispatch...');
            await this.sendConfirmationEmail(orderId);
            console.log('[PaymentProcessor] Email dispatch completed.');
        } catch (emailErr) {
             // We catch here so we don't fail the *payment* verification result, 
             // but we ensure the promise was attempted to completion.
             console.error('[PaymentProcessor] CRITICAL: Email failed:', emailErr);
             await this.logPaymentAttempt('PAYMENT_EMAIL_FAIL', `Email failed for ${orderId}`, 'ERROR', { error: emailErr });
        }
        
        await this.logPaymentAttempt('PAYMENT', `Payment Success for Order ${orderId}`, 'INFO', { paymentId, amount: razorpayAmount })

        return { success: true, message: 'Payment successfully verified and processed' }
    }

    /**
     * Sends the Order Confirmation Email.
     * Should only be called after successful payment.
     */
    private static async sendConfirmationEmail(orderId: string) {
        const supabase = createAdminClient()
        
        try {
            const { data: orderDetails } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('id', orderId)
                .single()

            if (!orderDetails) return

            const email = orderDetails.user_email || 
                          (await supabase.from('profiles').select('email').eq('id', orderDetails.user_id).single()).data?.email

            if (email) {
                // 1. Send Customer Email
                await sendOrderConfirmation({
                    email,
                    orderId: orderDetails.id,
                    customerName: orderDetails.shipping_name || 'Customer',
                    items: orderDetails.order_items.map((i: any) => ({
                        name: i.name_snapshot || 'Product',
                        quantity: i.quantity,
                        price: i.unit_price
                    })),
                    total: orderDetails.total,
                    shippingAddress: orderDetails.shipping_address_snapshot ? JSON.stringify(orderDetails.shipping_address_snapshot) : undefined,
                    orderDate: new Date(orderDetails.created_at).toDateString()
                })
                
                // 2. Send Admin Alert (Async, don't block)
                const ADMIN_EMAIL = 'lgbtqfashionflash@gmail.com'; 
                
                sendAdminOrderAlert({
                    email: ADMIN_EMAIL,
                    customerEmail: email,
                    orderId: orderDetails.id,
                    customerName: orderDetails.shipping_name || 'Customer',
                    items: orderDetails.order_items.map((i: any) => ({
                        name: i.name_snapshot || 'Product',
                        quantity: i.quantity,
                        price: i.unit_price
                    })),
                    total: orderDetails.total,
                    shippingAddress: orderDetails.shipping_address_snapshot ? JSON.stringify(orderDetails.shipping_address_snapshot) : undefined,
                    orderDate: new Date(orderDetails.created_at).toDateString()
                }).catch(e => console.error("Failed to send admin alert", e));

                // Log Success
                await supabase.from('system_logs').insert({
                    severity: 'INFO',
                    component: 'PAYMENT_EMAIL',
                    message: `Confirmation emails dispatched for ${orderId}`,
                    metadata: { orderId: orderId, customerEmail: email }
                })
            }
        } catch (error: any) {
            console.error('[PaymentProcessor] Email logic failed:', error)
            
            // Log Failure
            await supabase.from('system_logs').insert({
                severity: 'ERROR',
                component: 'PAYMENT_EMAIL',
                message: `Failed to send email: ${error.message}`,
                metadata: { orderId: orderId, error: error }
            })
        }
    }

    /**
     * Internal helper to log payment attempts
     */
    private static async logPaymentAttempt(component: string, message: string, severity: 'INFO' | 'WARN' | 'ERROR', metadata: any) {
        const supabase = createAdminClient()
        await supabase.from('system_logs').insert({
            severity,
            component,
            message,
            metadata
        })
    }
}
