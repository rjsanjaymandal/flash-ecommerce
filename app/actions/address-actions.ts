'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address_line1: z.string().min(1, "Address Line 1 is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(6, "Pincode is required"),
  country: z.string().default("India"),
  is_default: z.boolean().default(false)
})

export async function addAddress(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    const rawData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        address_line1: formData.get('address_line1'),
        address_line2: formData.get('address_line2'),
        city: formData.get('city'),
        state: formData.get('state'),
        pincode: formData.get('pincode'),
        is_default: formData.get('is_default') === 'on'
    }

    const validated = addressSchema.safeParse(rawData)

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    // If setting as default, unset others first
    if (validated.data.is_default) {
        await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', user.id)
    }

    const { error } = await supabase
        .from('addresses')
        .insert({
            ...validated.data,
            user_id: user.id
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/account')
    return { success: true }
}

export async function deleteAddress(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { error: "Unauthorized" }

    const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/account')
    return { success: true }
}

export async function setDefaultAddress(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { error: "Unauthorized" }

    // Unset all
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
    
    // Set new default
    const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/account')
    return { success: true }
}
