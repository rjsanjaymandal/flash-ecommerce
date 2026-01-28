'use server'

import { createAdminClient } from "@/lib/supabase/admin"

export async function reportError(message: string, component: string = 'CLIENT_UI', stack?: string) {
    try {
        const supabase = createAdminClient()
        
        const { error } = await supabase.from('system_logs').insert({
            severity: 'ERROR',
            component,
            message,
            metadata: { stack }
        })

        if (error) {
            console.error('[reportError] Supabase insertion failed:', error.message)
        }

        return { success: true, referenceId: crypto.randomUUID().slice(0, 8) }
    } catch (err) {
        console.error('[reportError] Critical Failure:', err)
        // Return success true anyway to prevent UI from thinking something went wrong with the error reporting itself
        return { success: true }
    }
}
