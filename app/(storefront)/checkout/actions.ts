'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createStaticClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'
import { CartItem } from '@/store/use-cart-store'
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
    const supabase = createStaticClient()

    try {
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
        const shippingFee = serverSubtotal >= 699 ? 0 : 50
        const finalServerTotal = serverTotal + shippingFee

        // Allow for minor floating point differences
        if (Math.abs(finalServerTotal - data.total) > 1) {
            console.error(`[Security] Price mismatch! Server: ${finalServerTotal}, Client: ${data.total}`)
            throw new Error("Security check failed: Price mismatch detected. Please refresh your cart.")
        }

        // 1. Create Order (Status PENDING) - Switch to Admin Client for insertion
        const adminSupabase = createAdminClient()
        const { data: order, error: orderError } = await adminSupabase
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
            // Data Sanitization: Convert empty strings to NULL to match DB stock logic
            size: item.size === '' ? null : item.size,
            color: item.color === '' ? null : item.color,
            name_snapshot: item.name // Ensure snapshot is preserved
        }))

        const { error: itemsError } = await adminSupabase
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
            const { error: reservationError } = await adminSupabase.rpc('reserve_stock', { 
                p_order_id: order.id 
            })

            if (reservationError) {
                 // Capture specific PG Error
                 console.error("Stock Reservation RPC Error:", reservationError)
                 throw new Error(reservationError.message)
            }
        } catch (e: any) {
            // Rollback: Delete the failed order
            console.error("Stock Reservation Failed [Fatal]:", {
                orderId: order.id,
                error: e.message,
                details: e
            })
            await adminSupabase.from('orders').delete().eq('id', order.id)
            
            // Show friendly error
            // Show friendly error
            if (e.message?.includes('Insufficient stock')) {
                 throw new Error("We're sorry, one or more items in your cart just sold out!")
            }
            if (e.message?.includes('function') && e.message?.includes('does not exist')) {
                 throw new Error("System Error: Database migration missing (reserve_stock). Please contact support.")
            }
            // Retain original error for debugging if it's safe-ish, or just log it. 
            // Better to show the actual error during dev phase:
            throw new Error(`Checkout Failed: ${e.message}`)
        }

        // Stock is now reserved. Proceed.

        // 4. Update Coupon Usage
        if (data.coupon_code) {
             try {
                const { data: coupon } = await adminSupabase.from('coupons').select('id, used_count').eq('code', data.coupon_code.toUpperCase()).single()
                if (coupon) {
                    await adminSupabase.from('coupons').update({ used_count: (coupon.used_count || 0) + 1 }).eq('id', coupon.id)
                }
            } catch (e) {
                console.error('Failed to increment coupon usage:', e)
            }
        }

        // Return the order immediately. 
        // We DO NOT send email here. The 'PaymentProcessor' will send the Confirmation Email 
        // once the payment is verified (via Verify API, Callback, or Webhook).
        
        return order
    } catch (e: any) {
        console.error("[createOrder] FATAL ERROR:", e)
        throw e
    }
}

export async function validateCoupon(code: string, orderTotal: number) {
    const supabase = createStaticClient()
    
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
