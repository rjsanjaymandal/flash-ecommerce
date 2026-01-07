import { createAdminClient } from "@/lib/supabase/admin"

export type ActionResponse<T> = {
    success: boolean
    data?: T
    error?: string
}

export async function createSafeAction<Input, Output>(
    actionName: string,
    input: Input,
    handler: (input: Input) => Promise<Output>
): Promise<ActionResponse<Output>> {
    try {
        const result = await handler(input)
        return { success: true, data: result }
    } catch (e: any) {
        console.error(`[SafeAction][${actionName}] Failed:`, e)

        // Log to DB (Fire & Forget)
        try {
            const supabase = createAdminClient()
            await supabase.from('system_logs').insert({
                severity: 'ERROR',
                component: actionName,
                message: e.message || 'Unknown error',
                metadata: { stack: e.stack, input }
            })
        } catch (logErr) {
            console.error('Failed to log safe action error:', logErr)
        }

        return { 
            success: false, 
            error: e.message || "An unexpected error occurred." 
        }
    }
}
