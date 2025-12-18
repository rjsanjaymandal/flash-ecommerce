'use server'

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

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
    items: any[],
    coupon_code?: string
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

    const serverTotal = serverSubtotal - serverDiscount

    // Allow for minor floating point differences (e.g., 0.01)
    if (Math.abs(serverTotal - data.total) > 1) {
        console.error(`[Security] Price mismatch! Server: ${serverTotal}, Client: ${data.total}`)
        throw new Error("Security check failed: Price mismatch detected. Please refresh your cart.")
    }

    // 1. Create Order
    const { data: order, error: orderError } = await (supabase
        .from('orders') as any)
        .insert({
            user_id: data.user_id,
            status: 'pending',
            subtotal: serverSubtotal,
            total: serverTotal,
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
            discount_amount: serverDiscount
        } as any)
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

    const { error: itemsError } = await (supabase
        .from('order_items') as any)
        .insert(orderItems)
    
    if (itemsError) {
        throw new Error(`Order items creation failed: ${itemsError.message}`)
    }

    // --- INVENTORY: Deduct Stock & Increment Sales ---
    for (const item of data.items) {
        try {
            // 1. Increment sale_count
            await (supabase as any).rpc('increment_product_sale', { pid: item.productId, qty: item.quantity })
            
            // 2. Deduct Stock
            const { data: currentStock } = await supabase
                .from('product_stock')
                .select('quantity')
                .eq('product_id', item.productId)
                .eq('size', item.size)
                .eq('color', item.color)
                .single()

            if (currentStock) {
                await supabase
                    .from('product_stock')
                    .update({ quantity: Math.max(0, (currentStock.quantity || 0) - item.quantity) })
                    .eq('product_id', item.productId)
                    .eq('size', item.size)
                    .eq('color', item.color)
            }
        } catch (stockErr) {
            console.error(`Inventory Sync Error for ${item.productId}:`, stockErr)
            // We don't fail the whole order if stock update fails, but we should log it
        }
    }

    // 3. Update Coupon Usage if applicable
    if (data.coupon_code) {
        const { data: coupon } = await supabase.from('coupons').select('id, used_count').eq('code', data.coupon_code.toUpperCase()).single()
        if (coupon) {
            await supabase.from('coupons').update({ used_count: (coupon.used_count || 0) + 1 }).eq('id', coupon.id)
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
