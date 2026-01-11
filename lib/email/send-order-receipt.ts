import { resend } from "@/lib/email/client";
import { OrderConfirmationEmail } from "@/lib/email/templates/order-confirmation";
import { AdminNewOrderEmail } from "@/lib/email/templates/admin-new-order";

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface SendOrderConfirmationProps {
    email: string;
    orderId: string;
    customerName: string;
    items: OrderItem[];
    total: number;
    shippingAddress?: string;
    orderDate: string;
}

interface SendAdminAlertProps extends SendOrderConfirmationProps {
    customerEmail: string;
}

interface ResendResponse {
    data: { id: string } | null;
    error: { message: string } | null;
}

export async function sendOrderConfirmation({
    email,
    orderId,
    customerName,
    items,
    total,
    shippingAddress,
    orderDate
}: SendOrderConfirmationProps) {
    console.log(`[Email] Attempting dispatch to ${email} for Order #${orderId}`);
    
    try {
        // Enforce 15s Timeout
        const emailPromise = resend.emails.send({
            from: 'FLASH Orders <orders@flashhfashion.in>',
            replyTo: 'orders@flashhfashion.in',
            to: email, // Sending ONLY to customer
            subject: `Order Confirmed! 🚀 #${orderId.slice(0, 8).toUpperCase()}`,
            react: OrderConfirmationEmail({
                orderId,
                customerName,
                items,
                total,
                shippingAddress,
                orderDate
            })
        });

        const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Email Dispatch Timeout (15s)')), 15000)
        );

        const data = await Promise.race([emailPromise, timeoutPromise]) as unknown as ResendResponse;

        if (data?.error) {
             throw new Error(`Resend API Error: ${data.error.message}`);
        }

        console.log(`[Email] Customer confirmation sent successfully. ID: ${data?.data?.id}`);
        return { success: true, id: data?.data?.id };

    } catch (error: any) {
        console.error('[Email] FAILED to send customer confirmation:', error.message);
        // Important: We re-throw so the caller (PaymentProcessor) knows it failed
        throw error;
    }
}

export async function sendAdminOrderAlert({
    email, // Admin email
    customerEmail,
    orderId,
    customerName,
    items,
    total,
    shippingAddress,
    orderDate
}: SendAdminAlertProps) {
    console.log(`[Email] Attempting ADMIN ALERT to ${email} for Order #${orderId}`);

    try {
        const emailPromise = resend.emails.send({
            from: 'FLASH System <system@flashhfashion.in>',
            to: email,
            subject: `💰 New Order: ${customerName} (₹${total})`,
            react: AdminNewOrderEmail({
                orderId,
                customerName,
                customerEmail,
                items,
                total
            }) 
        });

        const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Admin Email Dispatch Timeout (15s)')), 15000)
        );

        const data = await Promise.race([emailPromise, timeoutPromise]) as unknown as ResendResponse;

        if (data?.error) {
             throw new Error(`Resend Admin API Error: ${data.error.message}`);
        }

        console.log(`[Email] Admin alert sent successfully. ID: ${data?.data?.id}`);
        return { success: true, id: data?.data?.id };

    } catch (error: any) {
        console.error('[Email] FAILED to send admin alert:', error.message);
        throw error;
    }
}
