-- Consolidate duplicate/overlapping policies on Profiles to improve performance
-- "Admins can view all profiles" AND "Users can view own profile" -> "Unified Read Access"

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "users_read_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_read_all_profiles" ON public.profiles;

-- Create single optimized policy
-- Checks ownership first (fastest), then admin status
CREATE POLICY "Unified Read Access"
ON public.profiles
FOR SELECT
USING (
  (auth.uid() = id) 
  OR 
  (public.is_admin())
);
