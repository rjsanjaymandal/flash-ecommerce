import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { EmailWorker } from '@/lib/workers/email-worker'
import { AppEventPayload } from '@/lib/services/event-bus'

export const dynamic = 'force-dynamic' // Ensure no caching for worker

export async function GET(req: Request) {
    // 1. Security Check (Optional: Verify a cron secret header)
    const authHeader = req.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    try {
        // 2. Poll Pending Events (Limit 10 to avoid timeouts)
        const { data: events, error } = await supabase
            .from('app_events' as any)
            .select('*')
            .eq('status', 'PENDING')
            .order('created_at', { ascending: true })
            .limit(10) as { data: any[] | null, error: any }

        if (error) throw error

        if (!events || events.length === 0) {
            return NextResponse.json({ message: 'No pending events' })
        }

        const results = []

        // 3. Process Loop
        for (const event of events) {
            console.log(`[EventWorker] Processing event ${event.id} (${event.event_type})`)
            
            // Mark as PROCESSING
            await supabase.from('app_events' as any).update({ status: 'PROCESSING' }).eq('id', event.id)

            let success = false
            let errorMsg: string | null = null

            try {
                switch (event.event_type) {
                    case 'ORDER_PAID':
                        const payload = event.payload as AppEventPayload['ORDER_PAID']
                        const result = await EmailWorker.handleOrderPaid(payload.orderId)
                        if (result.success) {
                            success = true
                        } else {
                            errorMsg = result.error
                        }
                        break
                    
                    default:
                        errorMsg = `Unknown event type: ${event.event_type}`
                }
            } catch (e: unknown) {
                errorMsg = (e as Error).message
            }

            // 4. Update Status with Retry Logic
            if (success) {
                await supabase.from('app_events' as any).update({ 
                    status: 'COMPLETED', 
                    processed_at: new Date().toISOString() 
                }).eq('id', event.id)
            } else {
                const retryCount = (event.retry_count || 0) + 1
                const shouldRetry = retryCount < 3 // Max 3 retries
                
                await supabase.from('app_events' as any).update({ 
                    status: shouldRetry ? 'PENDING' : 'FAILED', 
                    retry_count: retryCount,
                    processing_error: errorMsg,
                    processed_at: new Date().toISOString()
                }).eq('id', event.id)
                
                console.warn(`[EventWorker] Event ${event.id} failed. ${shouldRetry ? 'Scheduled for retry' : 'Marked as FAILED'}. Error: ${errorMsg}`)
            }

            results.push({ id: event.id, success, error: errorMsg })
        }

        return NextResponse.json({ processed: results.length, details: results })

    } catch (e: unknown) {
        console.error('[EventWorker] Critical Error:', e)
        return NextResponse.json({ error: 'Worker failed' }, { status: 500 })
    }
}
