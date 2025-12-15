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
    const { data: order, error: orderError } = await supabase
        .from('orders')
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
            payment_reference: data.payment_reference
        })
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

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
    
    if (itemsError) {
        // Optional: Delete order if items fail?
        throw new Error(`Order items creation failed: ${itemsError.message}`)
    }

    return order
}
