import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderConfirmation, sendAdminOrderAlert } from '@/lib/email/send-order-receipt'
import { Tables } from '@/types/supabase'
import { Result, ok, err } from '@/lib/utils/result'

export class EmailWorker {
    /**
     * Handles the 'ORDER_PAID' event by sending confirmation emails.
     */
    static async handleOrderPaid(orderId: string): Promise<Result<boolean, string>> {
        const supabase = createAdminClient()
        console.log(`[EmailWorker] Processing ORDER_PAID for ${orderId}`)

        try {
            const { data: orderDetails, error } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('id', orderId)
                .single()

            if (error || !orderDetails) {
                return err(error?.message || 'Order not found')
            }

            const email = orderDetails.user_email || 
                          (await supabase.from('profiles').select('email').eq('id', orderDetails.user_id).single()).data?.email

            if (!email) {
                return err('No email found for user associated with order')
            }

            // 1. Send Customer Email
            await sendOrderConfirmation({
                email,
                orderId: orderDetails.id,
                customerName: orderDetails.shipping_name || 'Customer',
                items: orderDetails.order_items.map((i: Tables<'order_items'>) => ({
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
                items: orderDetails.order_items.map((i: Tables<'order_items'>) => ({
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
                component: 'EMAIL_WORKER',
                message: `Confirmation emails dispatched for ${orderId}`,
                metadata: { orderId: orderId, customerEmail: email }
            })

            return ok(true)

        } catch (error: unknown) {
            console.error('[EmailWorker] Failed:', error)
            
            await supabase.from('system_logs').insert({
                severity: 'ERROR',
                component: 'EMAIL_WORKER',
                message: `Failed to send email: ${(error as Error).message}`,
                metadata: { orderId: orderId, error: error }
            })

            return err((error as Error).message)
        }
    }
}
