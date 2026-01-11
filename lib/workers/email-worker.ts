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
            const { data: orderData, error } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('id', orderId)
                .single() as any

            if (error || !orderData) {
                return err(error?.message || 'Order not found')
            }

            const email = (orderData as any).user_email || 
                          (await supabase.from('profiles').select('email').eq('id', orderData.user_id).single() as any).data?.email

            if (!email) {
                return err('No email found for user associated with order')
            }

            // 1. Send Customer Email
            await sendOrderConfirmation({
                email,
                orderId: orderData.id,
                customerName: orderData.shipping_name || 'Customer',
                items: (orderData.order_items || []).map((i: any) => ({
                    name: i.name_snapshot || 'Product',
                    quantity: i.quantity,
                    price: i.unit_price
                })),
                total: orderData.total,
                shippingAddress: (orderData as any).shipping_address_snapshot ? JSON.stringify((orderData as any).shipping_address_snapshot) : undefined,
                orderDate: new Date(orderData.created_at).toDateString()
            })
            
            // 2. Send Admin Alert (Async, don't block)
            const ADMIN_EMAIL = 'lgbtqfashionflash@gmail.com'; 
            
            sendAdminOrderAlert({
                email: ADMIN_EMAIL,
                customerEmail: email,
                orderId: orderData.id,
                customerName: orderData.shipping_name || 'Customer',
                items: (orderData.order_items || []).map((i: any) => ({
                    name: i.name_snapshot || 'Product',
                    quantity: i.quantity,
                    price: i.unit_price
                })),
                total: orderData.total,
                shippingAddress: (orderData as any).shipping_address_snapshot ? JSON.stringify((orderData as any).shipping_address_snapshot) : undefined,
                orderDate: new Date(orderData.created_at).toDateString()
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
                metadata: { orderId: orderId, error: String(error) } as any
            })

            return err((error as Error).message)
        }
    }
}
