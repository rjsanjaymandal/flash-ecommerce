-- System Design: Observability & Audit Logs

-- 1. Admin Audit Logs
-- Tracks who changed what in critical tables (products, orders, stock)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id),
    action_type TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    changes JSONB, -- Previous/New values
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Only admins can view logs. No one can update/delete.
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" 
ON public.admin_audit_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 2. System Logs (For critical backend errors)
-- Used for capturing payment failures, race conditions, etc.
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    severity TEXT CHECK (severity IN ('INFO', 'WARN', 'ERROR', 'CRITICAL')),
    component TEXT NOT NULL, -- e.g. 'PAYMENT', 'STOCK', 'AUTH'
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Only service role can insert. Admins can view.
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view system logs" 
ON public.system_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Grant insert to service role
GRANT INSERT ON public.system_logs TO service_role;
GRANT INSERT ON public.admin_audit_logs TO service_role;
