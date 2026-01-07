'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { Database } from '@/types/supabase'
import { CartItem } from '@/store/use-cart-store'
import { resend } from '@/lib/email/client'
import { OrderConfirmationEmail } from '@/lib/email/templates/order-confirmation'
import { checkRateLimit } from '@/lib/rate-limit'

export async function createOrder(data: {
    user_id: string | null,
    subtotal: number,
    total: number,
    shipping_name: string,
    phone: string,
    address_line1: string,
    city: string,
    state: string,
    pincode: string,
    country: string,
    payment_provider: string,
    payment_reference: string,
    items: CartItem[],
    coupon_code?: string,
    discount_amount?: number,
    email?: string
}) {
    // Initialize Admin Client (Safe because 'use server' prevents client-side leaks)
    const supabase = createAdminClient()

    // --- SECURITY: Rate Limiting ---
    // Limit: 5 orders per 10 minutes per User
    if (data.user_id) {
        const { success } = await checkRateLimit(`checkout:user:${data.user_id}`, 5, 600)
        if (!success) {
            throw new Error('Too many order attempts. Please wait 10 minutes.')
        }
    }
    // --------------------------------

    // --- SECURITY: Server-side Price Verification ---
    const productIds = Array.from(new Set(data.items.map(i => i.productId)))
    const { data: products, error: priceError } = await supabase
        .from('products')
        .select('id, price')
        .in('id', productIds)

    if (priceError || !products) throw new Error("Security check failed: Could not verify product prices.")

    const priceMap = Object.fromEntries(products.map(p => [p.id, Number(p.price)]))
    
    let serverSubtotal = 0
    data.items.forEach(item => {
        const actualPrice = priceMap[item.productId]
        if (actualPrice === undefined) throw new Error(`Security check failed: Product ${item.productId} not found.`)
        serverSubtotal += actualPrice * item.quantity
    })

    // Re-verify Coupon
    let serverDiscount = 0
    if (data.coupon_code) {
        const validation = await validateCoupon(data.coupon_code, serverSubtotal)
        if (validation.valid) {
            if (validation.discount_type === 'percentage') {
                serverDiscount = (serverSubtotal * (validation.value || 0)) / 100
            } else {
                serverDiscount = validation.value || 0
            }
        } else {
            throw new Error(`Security check failed: ${validation.message}`)
        }
    }

    const serverTotal = Math.max(0, serverSubtotal - serverDiscount)
    
    // --- SHIPPING LOGIC ---
    // Free shipping for orders >= 1000, else 50
    const shippingFee = serverSubtotal >= 1000 ? 0 : 50
    const finalServerTotal = serverTotal + shippingFee

    // Allow for minor floating point differences
    if (Math.abs(finalServerTotal - data.total) > 1) {
        console.error(`[Security] Price mismatch! Server: ${finalServerTotal}, Client: ${data.total}`)
        throw new Error("Security check failed: Price mismatch detected. Please refresh your cart.")
    }

    // 1. Create Order (Status PENDING)
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: data.user_id,
            status: 'pending',
            subtotal: serverSubtotal,
            total: finalServerTotal,
            shipping_fee: shippingFee,
            shipping_name: data.shipping_name,
            phone: data.phone,
            address_line1: data.address_line1,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            country: data.country,
            payment_provider: data.payment_provider,
            payment_reference: data.payment_reference,
            coupon_code: data.coupon_code,
            discount_amount: serverDiscount,
        })
        .select()
        .single()

    if (orderError) throw new Error(`Order creation failed: ${orderError.message}`)

    // 2. Create Order Items
    const orderItems = data.items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: priceMap[item.productId],
        size: item.size,
        color: item.color,
        name_snapshot: item.name // Ensure snapshot is preserved
    }))

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
    
    if (itemsError) {
        throw new Error(`Order items creation failed: ${itemsError.message}`)
    }

    // --- SECURITY: Strict Inventory Integrity Check ---
    // Fast fail if stock is already zero before proceeding to payment
    const { data: stockItems, error: stockCheckError } = await supabase
        .from('product_stock')
        .select('product_id, size, color, quantity')
        .in('product_id', productIds)

    if (stockCheckError) throw new Error("Inventory check failed. Please try again.")

    const stockMap = new Map<string, number>()
    stockItems?.forEach(item => {
        stockMap.set(`${item.product_id}-${item.size}-${item.color}`, item.quantity || 0)
    })

    for (const item of data.items) {
        const key = `${item.productId}-${item.size}-${item.color}`
        const available = stockMap.get(key) || 0
        if (available < item.quantity) {
             throw new Error(`Sold Out: ${item.name} (${item.size}/${item.color}) is no longer available.`)
        }
    }

    // 3. RESERVE STOCK ATOMICALLY
    // We call the RPC to immediately decrement stock.
    // If this fails (insufficient stock), we must roll back (delete order) and inform user.
    try {
        const { error: reservationError } = await supabase.rpc('reserve_stock', { 
            p_order_id: order.id 
        })

        if (reservationError) {
             throw new Error(reservationError.message)
        }
    } catch (e: any) {
        // Rollback: Delete the failed order
        console.error("Stock Reservation Failed:", e)
        await supabase.from('orders').delete().eq('id', order.id)
        
        // Show friendly error
        if (e.message?.includes('Insufficient stock')) {
             throw new Error("We're sorry, one or more items in your cart just sold out!")
        }
        throw new Error("Failed to reserve inventory. Please try again.")
    }

    // Stock is now reserved. Proceed.

    // 3. Update Coupon Usage count (informational/soft-reserve)
    if (data.coupon_code) {
        try {
            const { data: coupon } = await supabase.from('coupons').select('id, used_count').eq('code', data.coupon_code.toUpperCase()).single()
            if (coupon) {
                await supabase.from('coupons').update({ used_count: (coupon.used_count || 0) + 1 }).eq('id', coupon.id)
            }
        } catch (e) {
            console.error('Failed to increment coupon usage:', e)
        }
    }

    // 4. Send Confirmation Email (Async)
    if (data.email) {
        try {
            await resend.emails.send({
                from: 'Flash <orders@flashhfashion.in>', // Using the domain from sitemap
                to: data.email,
                subject: `Order Created #${order.id.slice(0,8).toUpperCase()} - Action Required`,
                react: OrderConfirmationEmail({
                    orderId: order.id,
                    customerName: data.shipping_name,
                    items: data.items.map(i => ({
                        name: i.name,
                        quantity: i.quantity,
                        price: i.price
                    })),
                    total: data.total
                })
            })
        } catch (emailErr) {
            console.error('Failed to send email:', emailErr)
        }
    }

    return order
}

export async function validateCoupon(code: string, orderTotal: number) {
    const supabase = createAdminClient()
    
    const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .single()

    if (error || !coupon) {
        return { valid: false, message: 'Invalid coupon code' }
    }

    if (!coupon.active) {
        return { valid: false, message: 'This coupon is no longer active' }
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return { valid: false, message: 'This coupon has expired' }
    }

    if (coupon.max_uses && (coupon.used_count || 0) >= coupon.max_uses) {
        return { valid: false, message: 'This coupon usage limit has been reached' }
    }

    if (coupon.min_order_amount && orderTotal < coupon.min_order_amount) {
        return { valid: false, message: `Minimum order amount of ${coupon.min_order_amount} required` }
    }

    return { 
        valid: true, 
        message: 'Coupon applied', 
        discount_type: coupon.discount_type, 
        value: coupon.value 
    }
}
