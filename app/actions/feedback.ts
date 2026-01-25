'use server'

import { createClient } from "@/lib/supabase/server"

export async function submitFeedback(formData: {
    firstName: string;
    lastName: string;
    email: string;
    message: string;
    topic?: string;
}) {
    try {
        const supabase = await createClient()
        
        const { error } = await supabase.from('feedback').insert({
            topic: formData.topic || 'General Contact',
            email: formData.email,
            message: `From: ${formData.firstName} ${formData.lastName}\n\n${formData.message}`,
            // Assuming the schema follows what was seen in the admin page: id, created_at, topic, email, message
        })

        if (error) throw error

        return { success: true }
    } catch (err: any) {
        console.error('Failed to submit feedback:', err)
        return { success: false, error: err.message || 'Unknown error occurred' }
    }
}
