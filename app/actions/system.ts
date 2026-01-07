'use server'

import { createAdminClient } from "@/lib/supabase/admin"

export async function reportError(message: string, component: string = 'CLIENT_UI', stack?: string) {
    try {
        const supabase = createAdminClient()
        
        await supabase.from('system_logs').insert({
            severity: 'ERROR',
            component,
            message,
            metadata: { stack }
        })

        return { success: true, referenceId: crypto.randomUUID().slice(0, 8) }
    } catch (err) {
        console.error('Failed to log error:', err)
        return { success: false }
    }
}
