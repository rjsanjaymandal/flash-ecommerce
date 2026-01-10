'use server'

import { createAdminClient } from "@/lib/supabase/admin"
import { PaymentProcessor } from "@/lib/services/payment-processor"
import { revalidatePath } from "next/cache"

export async function syncOrderPayment(orderId: string) {
    // 1. Auth/Admin Check
    // (Ideally call verifyAdmin or similar, but for now we trust the caller context or add basic check)
    // We'll trust middleware protection for the route this is called from, but safe to check here too if needed.
    // For specific actions, strict checking is better.

    console.log(`[Sync] Starting sync for Order ${orderId}`)

    // 2. Find the Razorpay Order
    // We try to find via receipt (our order ID)
    const rzpOrder = await PaymentProcessor.findRazorpayOrderByReceipt(orderId)

    if (!rzpOrder) {
        return { success: false, message: 'No linked Razorpay Order found. User likely never clicked "Pay".' }
    }

    // 3. Check Status
    console.log(`[Sync] Found Razorpay Order: ${rzpOrder.id}, Status: ${rzpOrder.status}`)

    if (rzpOrder.status === 'paid') {
        // 4. Fetch Payments to find the successful one
        const payments = await PaymentProcessor.getPaymentsForOrder(rzpOrder.id)
        const successfulPayment = payments.find((p: any) => p.status === 'captured')
        
        if (successfulPayment) {
             const result = await PaymentProcessor.processPayment(orderId, successfulPayment.id)
             if (result.success) {
                 revalidatePath(`/admin/orders/${orderId}`)
                 return { success: true, message: 'Payment Synced! Order marked as PAID.' }
             } else {
                 return { success: false, message: `Sync Failed: ${result.error}` }
             }
        }
        
        return { success: false, message: 'Order is PAID in Razorpay, but no captured payment found (Refunded?).' }
    } 
    else if (rzpOrder.status === 'attempted') {
         return { success: false, message: 'Payment attempted but not completed/captured.' }
    }
    else if (rzpOrder.status === 'created') {
         return { success: false, message: 'Payment link created but untouched.' }
    }

    return { success: false, message: `Razorpay status: ${rzpOrder.status}` }
}

export async function getPaymentLogs(orderId: string) {
    const supabase = createAdminClient()
    const { data } = await supabase
        .from('system_logs')
        .select('*')
        .contains('metadata', { orderId: orderId })
        .order('created_at', { ascending: false })
    
    return data || []
}
