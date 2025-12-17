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
    items: any[]
}) {
    // Initialize Admin Client
    const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Create Order
    const { data: order, error: orderError } = await (supabase
        .from('orders') as any)
        .insert({
            user_id: data.user_id,
            status: 'pending',
            subtotal: data.subtotal,
            total: data.total,
            shipping_name: data.shipping_name,
            phone: data.phone,
            address_line1: data.address_line1,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            country: data.country,
            payment_provider: data.payment_provider,
            payment_reference: data.payment_reference,
            coupon_code: (data as any).coupon_code,
            discount_amount: (data as any).discount_amount
        } as any)
        .select()
        .single()

    if (orderError) throw new Error(`Order creation failed: ${orderError.message}`)

    // 2. Create Order Items
    const orderItems = data.items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price, 
        size: item.size,
        color: item.color
    }))

    const { error: itemsError } = await (supabase
        .from('order_items') as any)
        .insert(orderItems)
    
    if (itemsError) {
        // Optional: Delete order if items fail?
        throw new Error(`Order items creation failed: ${itemsError.message}`)
    }

    // 3. Update Coupon Usage if applicable
    if ((data as any).coupon_code) {
        const { data: coupon } = await supabase.from('coupons').select('id, used_count').eq('code', (data as any).coupon_code).single()
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
