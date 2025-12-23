import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { CartItem } from '@/store/use-cart-store'
import { resend } from '@/lib/email/client'
import { OrderConfirmationEmail } from '@/lib/email/templates/order-confirmation'

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
    // Initialize Admin Client
    const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // --- SECURITY: Rate Limiting ---
    if (data.user_id) {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
        const { count: recentOrderCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', data.user_id)
            .gte('created_at', tenMinutesAgo)
        
        if (recentOrderCount && recentOrderCount >= 3) {
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

    // Allow for minor floating point differences (e.g., 1.00 because of JS math)
    if (Math.abs(finalServerTotal - data.total) > 1) {
        console.error(`[Security] Price mismatch! Server: ${finalServerTotal} (Sub: ${serverSubtotal} - Disc: ${serverDiscount} + Ship: ${shippingFee}), Client: ${data.total}`)
        throw new Error("Security check failed: Price mismatch detected. Please refresh your cart.")
    }

    // 1. Create Order
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

    // 2. Create Order Items & Deduct Stock
    const orderItems = data.items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: priceMap[item.productId], // Use server-verified price
        size: item.size,
        color: item.color
    }))

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
    
    if (itemsError) {
        throw new Error(`Order items creation failed: ${itemsError.message}`)
    }

    // --- SECURITY: Strict Inventory Check (Hybrid Cache Guard) ---
    // Before we even try to decrement, we MUST verify stock strictly from DB
    // This catches the case where the 15m cache said "In Stock" but it's actually 0.
    const { data: stockItems, error: stockCheckError } = await supabase
        .from('product_stock')
        .select('product_id, size, color, quantity')
        .in('product_id', productIds)

    if (stockCheckError) throw new Error("Inventory check failed. Please try again.")

    // Map for easy lookup: productId-size-color -> quantity
    const stockMap = new Map<string, number>()
    stockItems?.forEach(item => {
        stockMap.set(`${item.product_id}-${item.size}-${item.color}`, item.quantity || 0)
    })

    // Validate every item
    for (const item of data.items) {
        const key = `${item.productId}-${item.size}-${item.color}`
        const available = stockMap.get(key) || 0
        
        if (available < item.quantity) {
             throw new Error(`Sold Out: ${item.name} (${item.size}/${item.color}) is no longer available.`)
        }
    }
    // -----------------------------------------------------------

    // --- INVENTORY: Deduct Stock & Increment Sales ---
    for (const item of data.items) {
        try {
            // 1. Deduct Stock using Atomic RPC
            const { error: rpcError } = await (supabase as any).rpc('decrement_stock', { 
                p_product_id: item.productId, 
                p_size: item.size, 
                p_color: item.color, 
                p_quantity: item.quantity 
            })

            if (rpcError) {
                console.error(`Inventory Sync Error for ${item.productId}:`, rpcError)
                
                // COMPENSATION LOGIC: Cancel the order immediately
                await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
                
                if (rpcError.message.includes('Insufficient stock')) {
                    throw new Error(`Item ${item.name} is out of stock. Order cancelled.`)
                }
                throw new Error("Inventory sync failed. Order cancelled.")
            }

            // 2. Increment sale_count (Fire & Forget, rarely critical)
            await (supabase as any).rpc('increment_product_sale', { pid: item.productId, qty: item.quantity })
            
        } catch (stockErr: any) {
            console.error(`CRITICAL: Stock deduction failed for order ${order.id}`, stockErr)
            // Ensure we propagate the error so the client knows
            // COMPENSATION: Double check cancellation
            await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id)
            throw new Error(stockErr.message || "Stock reservation failed. Order cancelled.")
        }
    }

    // 3. Update Coupon Usage if applicable
    if (data.coupon_code) {
        const { data: coupon } = await supabase.from('coupons').select('id, used_count').eq('code', data.coupon_code.toUpperCase()).single()
        if (coupon) {
            await supabase.from('coupons').update({ used_count: (coupon.used_count || 0) + 1 }).eq('id', coupon.id)
        }
    }

    // 4. Send Confirmation Email (Async/Fire & Forget)
    if (data.email) {
        try {
            await resend.emails.send({
                from: 'Flash <orders@yourdomain.com>', // Update this with verified domain
                to: data.email,
                subject: `Order Confirmed #${order.id.slice(0,8).toUpperCase()}`,
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
            console.log(`Email sent to ${data.email}`)
        } catch (emailErr) {
            console.error('Failed to send email:', emailErr)
            // Don't fail the order for this
        }
    }

    return order
}

export async function validateCoupon(code: string, orderTotal: number) {
    const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
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
