-- Migration: Secure Order Lifecycle Events
-- Purpose: Enable RLS and add policies to protect order history logs.

-- 1. Enable RLS
ALTER TABLE public.order_lifecycle_events ENABLE ROW LEVEL SECURITY;

-- 2. Revoke public access (Ensure only defined roles/policies work)
-- This is implicit when RLS is enabled, but good practice.

-- 3. DROP existing policies if any
DROP POLICY IF EXISTS "Admin Full Access Lifecycle" ON public.order_lifecycle_events;
DROP POLICY IF EXISTS "View Own Order Events" ON public.order_lifecycle_events;

-- 4. Admin Access: Full control for administrators
CREATE POLICY "Admin Full Access Lifecycle"
ON public.order_lifecycle_events
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. User Access: Can only view events related to their own orders
-- We join with the orders table to verify ownership
CREATE POLICY "View Own Order Events"
ON public.order_lifecycle_events
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE id = public.order_lifecycle_events.order_id 
        AND user_id = auth.uid()
    )
);

-- Force schema reload for PostgREST
NOTIFY pgrst, 'reload schema';
