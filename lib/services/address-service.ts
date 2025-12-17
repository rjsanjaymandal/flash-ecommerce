'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Address = {
    id: string
    user_id: string
    name: string
    address_line1: string
    address_line2?: string | null
    city: string
    state: string
    pincode: string
    country: string
    phone: string
    is_default: boolean
}

export async function getAddresses() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return []

    const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
    
    return (data || []) as Address[]
}

export async function addAddress(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { error: 'Not authenticated' }

    const rawData = {
        user_id: user.id,
        name: formData.get('name') as string,
        address_line1: formData.get('address1') as string,
        address_line2: formData.get('address2') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        pincode: formData.get('pincode') as string,
        phone: formData.get('phone') as string,
        country: 'India', // Default for now
        is_default: formData.get('is_default') === 'on'
    }

    // If default, unset others
    if (rawData.is_default) {
        await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', user.id)
    }

    const { error } = await supabase.from('addresses').insert(rawData)
    
    if (error) {
        console.error('Add Address Error:', error)
        return { error: 'Failed to add address' }
    }

    revalidatePath('/checkout')
    return { success: true }
}
