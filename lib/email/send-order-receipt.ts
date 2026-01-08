import { resend } from "@/lib/email/client";
import { OrderConfirmationEmail } from "@/lib/email/templates/order-confirmation";

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
}

export async function sendOrderConfirmation({
    email,
    orderId,
    customerName,
    items,
    total
}: SendOrderConfirmationProps) {
    try {
        // Fire-and-forget execution can be simulated by not awaiting this promise in the caller,
        // but here we just define the async function.
        // The sender configuration is critical as per user request.
        
        await resend.emails.send({
            from: 'FLASH Orders <orders@flashhfashion.in>',
            replyTo: 'orders@flashhfashion.in',
            bcc: 'lgbtqfashionflash@gmail.com',
            to: email,
            subject: `Order Confirmed! 🚀 #${orderId.slice(0, 8).toUpperCase()}`,
            react: OrderConfirmationEmail({
                orderId,
                customerName,
                items,
                total
            })
        });

        console.log(`Email sent successfully to ${email} for order ${orderId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to send order confirmation email:', error);
        return { success: false, error };
    }
}
