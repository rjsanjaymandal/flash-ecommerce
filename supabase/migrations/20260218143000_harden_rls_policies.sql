-- Database Security Hardening: RLS Policies for rate_limits and feedback

-- 1. HARDEN rate_limits
-- Ensure RLS is enabled
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Explicitly allow service_role full access (this is default but good to be explicit here)
DROP POLICY IF EXISTS "Allow service_role full access to rate_limits" ON public.rate_limits;
CREATE POLICY "Allow service_role full access to rate_limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- NOTE: No policies for 'anon' or 'authenticated' means they are locked out, which is intended behavior for this table.


-- 2. HARDEN feedback
-- Enable RLS (it was disabled)
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow ANYONE to insert feedback (Contact form usage)
DROP POLICY IF EXISTS "Allow anyone to insert feedback" ON public.feedback;
CREATE POLICY "Allow anyone to insert feedback"
ON public.feedback
FOR INSERT
TO public
WITH CHECK (true);

-- Only Admins can view/manage feedback
DROP POLICY IF EXISTS "Only admins can manage feedback" ON public.feedback;
CREATE POLICY "Only admins can manage feedback"
ON public.feedback
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Grant permissions for feedback table
GRANT INSERT ON public.feedback TO anon, authenticated;
GRANT ALL ON public.feedback TO service_role;

-- Document the change
COMMENT ON TABLE public.rate_limits IS 'Rate limiting storage. Secured via RLS: service_role only.';
COMMENT ON TABLE public.feedback IS 'User feedback/contact submissions. Secured via RLS: public insert, admin read.';
