
import crypto from 'crypto'

import { createAdminClient } from '@/lib/supabase/admin'
// import { sendOrderConfirmation, sendAdminOrderAlert } from '@/lib/email/send-order-receipt' // DEPRECATED: Handled by Worker
import Razorpay from 'razorpay'
import { Tables } from '@/types/supabase'
import { Result, ok, err } from '@/lib/utils/result'
import { EventBus } from '@/lib/services/event-bus'

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
            const notes = rzpOrder.notes as Record<string, string> | undefined
            
            if (notes?.order_id) {
                return notes.order_id
            }

            if (rzpOrder.receipt) {
                return rzpOrder.receipt
            }

            return null
        } catch (error: unknown) {
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
         } catch (e: unknown) {
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
        } catch (e: unknown) {
            console.warn('[PaymentProcessor] Failed to fetch payments:', e)
            return []
        }
    }

    /**
     * Core atomic function to mark an order as PAID in the database
     * and trigger the confirmation email.
     */
    static async processPayment(orderId: string, paymentId: string): Promise<Result<{ message: string }, string>> {
        const supabase = createAdminClient()
        
        // 0. Deep Verification: Fetch Razorpay Payment Details First
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return err('Server Configuration Error: Missing Keys')
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
                 const statusError = `Invalid Payment Status: ${razorpayStatus} for ${paymentId}`
                 console.warn(`[PaymentProcessor] ${statusError}`)
                 await this.logPaymentAttempt('PAYMENT_STATUS', statusError, 'WARN', { orderId, paymentId, status: razorpayStatus })
                 return err(`Payment not captured: ${razorpayStatus}`)
            }
        } catch (e: unknown) {
            console.error('[PaymentProcessor] Razorpay Fetch Failed:', e)
            return err(`Invalid Payment ID: ${(e as Error).message}`)
        }

        // 1. Fetch current order status (Idempotency Check)
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('id, status, total, user_id')
            .eq('id', orderId)
            .single()

        if (fetchError || !order) {
            console.error('[PaymentProcessor] Order Fetch Error:', fetchError)
            return err('Order not found')
        }

        if (order.status === 'paid') {
            await this.logPaymentAttempt('PAYMENT', `Idempotent success for Order ${orderId}`, 'INFO', { paymentId })
            return ok({ message: 'Payment verified (previously processed)' })
        }
        
        // 2. Strict Amount Check (Security)
        const expectedAmountPaise = Math.round(order.total * 100)
        
        if (razorpayAmount !== expectedAmountPaise) {
            const mismatchError = `Amount Mismatch: Expected ${expectedAmountPaise}, Received ${razorpayAmount}`
            console.error(`[PaymentProcessor] SECURITY ALERT: ${mismatchError}`)
            
            await this.logPaymentAttempt('PAYMENT_SECURITY', mismatchError, 'ERROR', { 
                orderId, paymentId, expected: expectedAmountPaise, received: razorpayAmount 
            })
            
            return err('Payment verification failed: Amount Mismatch')
        }

        // 3. Atomic Finalization via RPC
        const { data: rpcResult, error: rpcError } = await supabase.rpc('finalize_payment_v3', {
             p_order_id: orderId,
             p_payment_id: paymentId,
             p_amount_paid: razorpayAmount
        })
        
        if (rpcError) {
             console.error('[PaymentProcessor] RPC Error:', rpcError)
             await this.logPaymentAttempt('PAYMENT_DB_ERROR', `RPC Failed for ${orderId}`, 'ERROR', { error: rpcError })
             return err('Transaction failed: ' + rpcError.message)
        }

        const result = rpcResult as { success: boolean, message?: string, error?: string };
        if (!result.success) {
             console.error('[PaymentProcessor] RPC Logic Error:', result.error)
             await this.logPaymentAttempt('PAYMENT_DB_FAILED', `RPC reported failure for ${orderId}`, 'ERROR', { error: result.error })
             return err(result.error || 'Payment finalization failed in database')
        }
        
        // 5. Publish Event (Async Architecture)
        // Decoupled: Emits event to DB, Worker picks it up to send emails.
        const eventResult = await EventBus.publish('ORDER_PAID', {
            orderId,
            paymentId,
            amount: razorpayAmount
        })

        if (!eventResult.success) {
             console.error('[PaymentProcessor] Failed to publish ORDER_PAID event:', eventResult.error)
             await this.logPaymentAttempt('PAYMENT_EVENT_FAIL', `Event Pub failed for ${orderId}`, 'ERROR', { error: eventResult.error })
             // Note: We do NOT fail the payment itself, as the transaction is secure. 
             // Admin should monitor system_logs/app_events for stuck events.
        } else {
             console.log('[PaymentProcessor] Published ORDER_PAID event:', eventResult.data.id)
        }
        
        await this.logPaymentAttempt('PAYMENT', `Payment Success for Order ${orderId}`, 'INFO', { paymentId, amount: razorpayAmount })

        return ok({ message: 'Payment successfully verified and processed' })
    }



    /**
     * Internal helper to log payment attempts
     */
    private static async logPaymentAttempt(component: string, message: string, severity: 'INFO' | 'WARN' | 'ERROR', metadata: Record<string, unknown>) {
        const supabase = createAdminClient()
        await supabase.from('system_logs').insert({
            severity,
            component,
            message,
            metadata: metadata as any
        })
    }
}
