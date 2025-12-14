-- Force Enable RLS on Categories (Policies exist but RLS might be off)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Force Enable RLS on Feedback (if it exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'feedback') THEN
    ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
    
    -- Ensure at least one policy exists so it's not locked down completely (or leave locked if intended)
    -- For now, we'll allow Admins to manage it, assuming it's an admin feature
    DROP POLICY IF EXISTS "Admin Full Access Feedback" ON public.feedback;
    CREATE POLICY "Admin Full Access Feedback"
    ON public.feedback
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
  END IF;
END $$;
