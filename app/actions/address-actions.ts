'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createSafeAction } from "@/lib/safe-action"

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
    return createSafeAction("addAddress", { 
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        address_line1: formData.get('address_line1') as string,
        address_line2: formData.get('address_line2') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        pincode: formData.get('pincode') as string,
        is_default: formData.get('is_default') === 'on'
    }, async (rawData) => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error("Unauthorized")

        const validated = addressSchema.safeParse(rawData)
        if (!validated.success) throw new Error(validated.error.issues[0].message)

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

        if (error) throw new Error(error.message)

        revalidatePath('/account')
        return { success: true }
    })
}

export async function deleteAddress(id: string) {
    return createSafeAction("deleteAddress", { id }, async ({ id }) => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) throw new Error("Unauthorized")

        const { error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw new Error(error.message)

        revalidatePath('/account')
        return { success: true }
    })
}

export async function setDefaultAddress(id: string) {
    return createSafeAction("setDefaultAddress", { id }, async ({ id }) => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) throw new Error("Unauthorized")

        // Unset all
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
        
        // Set new default
        const { error } = await supabase
            .from('addresses')
            .update({ is_default: true })
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw new Error(error.message)

        revalidatePath('/account')
        return { success: true }
    })
}
