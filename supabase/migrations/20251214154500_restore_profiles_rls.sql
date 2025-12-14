-- Revert consolidated policy on Profiles to ensure stability
-- Sometimes OR conditions with Security Definer functions can cause subtle recursion issues on some Postgres versions

DROP POLICY IF EXISTS "Unified Read Access" ON public.profiles;

-- 1. Users can view their own profile (Simple, fast, no function call)
CREATE POLICY "Users View Own Profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- 2. Admins can view all profiles (Explicit function call)
CREATE POLICY "Admins View All Profiles"
ON public.profiles FOR SELECT
USING (public.is_admin());

-- Reload config to ensure clean state
NOTIFY pgrst, 'reload config';
