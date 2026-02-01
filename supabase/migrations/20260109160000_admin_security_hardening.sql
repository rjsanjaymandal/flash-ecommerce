-- Admin Security Hardening
-- Goal: Prevent Privilege Escalation and Unauthorized Writes

-- 1. PROFILES: Prevent Role Escalation
-- Users should be able to update their own 'name' or 'email' (if sync), but NEVER 'role'.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Policy: Users update own profile (Restricted)
-- Note: Supabase/PostgreSQL doesn't natively support column-level RLS easily for updates in the USING clause without triggers.
-- However, we can use a CHECK constraint or a separate Trigger. 
-- For simplicity in RLS, we allow update if uid matches. The Application Logic (Next.js) must filter inputs.
-- BUT to be safe at DB level, we create a trigger.

CREATE OR REPLACE FUNCTION public.prevent_role_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If the role is being changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- And the user is NOT a super-admin (service role) or explicit admin
    -- (We assume normal RLS prevents cross-user updates, so we check if the user is trying to hack themselves)
    -- Actually, simpler: ONLY Admins can change roles.
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: You cannot change your own role.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_prevent_role_change ON public.profiles;
CREATE TRIGGER tr_prevent_role_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_update();

-- Re-apply Update Policy
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- 2. PRODUCTS: Double Check Deletion (already covered by previous migration, but good to reaffirm)
-- Verified in FIX_PRODUCTS_AND_STOCK_RLS.sql

-- 3. AUDIT LOGS (Optional: New Table for Admin Actions)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    target_id TEXT, -- formatted as string, e.g. "product:123"
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only Admins can insert audit logs (via server actions)
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can insert audit logs"
ON public.admin_audit_logs
FOR INSERT
WITH CHECK (public.is_admin());

-- Only Admins can view audit logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_logs
FOR SELECT
USING (public.is_admin());

-- Force schema reload
NOTIFY pgrst, 'reload schema';
