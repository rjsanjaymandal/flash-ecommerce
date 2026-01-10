import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderConfirmation } from '@/lib/email/send-order-receipt'
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
             // Razorpay Orders API supports fetching multiple. We filter manually if needed or rely on receipt logic if supported
             // Actually, listing orders doesn't support 'receipt' filter directly in all SDK versions.
             // But we can fetch orders and check. Or efficient way: 
             // Ideally we should have stored RZP ID. Since we didn't, we might have to scan recent orders?
             // LIMITATION: Scanning is slow. 
             // ALTERNATIVE: Checking `payment_reference` column in `orders` table but it's null if pending.
             
             // Let's assume for now we can't easily find it without ID.
             // BUT, wait! If the user TRIED to pay, a Razorpay Order WAS created with `receipt = order_id`.
             // We can use the Razorpay API to fetch all orders with `receipt`? 
             // SDK `orders.all({ receipt: ... })` might work? Docs say `receipt` filter is supported.
             
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
    static async processPayment(orderId: string, paymentId: string): Promise<VerificationResult> {
        const supabase = createAdminClient()

        // 1. Database Atomic Update
        const { data: result, error: rpcError } = await supabase.rpc('process_payment', {
            p_order_id: orderId,
            p_payment_id: paymentId
        })

        if (rpcError) {
            console.error('[PaymentProcessor] RPC Error:', rpcError)
            await this.logPaymentAttempt('PAYMENT_RPC', `Database failure for Order ${orderId}`, 'ERROR', { error: rpcError })
            return { success: false, error: 'Database transaction failed' }
        }

        // 2. Handle Idempotency (Already Paid)
        if (!result.success) {
            if (result.message === 'Already processed') {
                await this.logPaymentAttempt('PAYMENT', `Idempotent success for Order ${orderId}`, 'INFO', { paymentId })
                return { success: true, message: 'Payment verified (previously processed)' }
            }
            
            await this.logPaymentAttempt('PAYMENT', `Payment rejected for Order ${orderId}`, 'WARN', { reason: result.error })
            return { success: false, error: result.error || 'Payment processing failed in database' }
        }

        // 3. Trigger Email (Fire and Forget)
        // We do this asynchronously so we don't block the response
        this.sendConfirmationEmail(orderId).catch(err => 
            console.error('[PaymentProcessor] Background Email Error:', err)
        )
        
        await this.logPaymentAttempt('PAYMENT', `Payment Success for Order ${orderId}`, 'INFO', { paymentId })

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
                await sendOrderConfirmation({
                    email,
                    orderId: orderDetails.id,
                    customerName: orderDetails.shipping_name || 'Customer',
                    items: orderDetails.order_items.map((i: any) => ({
                        name: i.name_snapshot || 'Product',
                        quantity: i.quantity,
                        price: i.unit_price
                    })),
                    total: orderDetails.total
                })
                
                // Log Success
                await supabase.from('system_logs').insert({
                    severity: 'INFO',
                    component: 'PAYMENT_EMAIL',
                    message: `Confirmation email sent to ${email}`,
                    metadata: { orderId: orderId, email: email }
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
