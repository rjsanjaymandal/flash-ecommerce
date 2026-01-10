-- Webhook Event Ledger
-- Stores raw webhook events for audit, replay, and debugging.
-- Failsafe against processing errors.

CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id TEXT UNIQUE NOT NULL, -- Razorpay Event ID (prevents processing same event twice at global level)
    event_type TEXT NOT NULL,      -- 'order.paid', etc.
    payload JSONB NOT NULL,         -- Full raw body
    processed BOOLEAN DEFAULT FALSE, -- Marked true after successful processing
    processing_error TEXT,         -- Error message if failed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Only service role can access
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.webhook_events TO service_role;
GRANT SELECT ON public.webhook_events TO authenticated; -- Admins (via policy) might want to view

CREATE POLICY "Admins can view webhook events"
ON public.webhook_events FOR SELECT
USING (public.is_admin());
