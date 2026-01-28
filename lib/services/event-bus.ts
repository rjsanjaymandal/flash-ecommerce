import { createAdminClient } from '@/lib/supabase/admin'
import { Result, ok, err } from '@/lib/utils/result'

export type EventType = 'ORDER_PAID' | 'PRODUCT_UPDATED' | 'USER_SIGNUP'

export interface AppEventPayload {
    ORDER_PAID: { 
        orderId: string; 
        paymentId: string; 
        amount: number;
        method?: 'PREPAID' | 'PARTIAL_COD' | 'COD';
        status?: string;
        due?: number;
    }
    PRODUCT_UPDATED: { productId: string }
    USER_SIGNUP: { userId: string; email: string }
}

export class EventBus {
    /**
     * Publish an event to the persistent queue (app_events table)
     */
    static async publish<T extends EventType>(
        type: T,
        payload: AppEventPayload[T]
    ): Promise<Result<{ id: string }, string>> {
        try {
            const supabase = createAdminClient()
            
            const { data, error } = await supabase
                .from('app_events' as any)
                .insert({
                    event_type: type,
                    payload: payload,
                    status: 'PENDING'
                })
                .select('id')
                .single() as { data: { id: string } | null, error: any };

            if (error || !data) {
                console.error(`[EventBus] Failed to publish ${type}:`, error)
                return err(error?.message || 'Failed to record event')
            }
            
            return ok({ id: (data as any).id })
        } catch (e: unknown) {
            console.error(`[EventBus] Unexpected error publishing ${type}:`, e)
            return err(String(e))
        }
    }
}
