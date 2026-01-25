-- EMERGENCY DEBUG: Disable RLS on categories to unblock creation
-- This confirms if the "RLS Loop" is the cause of the timeout.

ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- If this fixes the "Timeout" error, then we interpret that the Policies are indeed recursive.
-- We will re-enable them later with a simplified approach.
