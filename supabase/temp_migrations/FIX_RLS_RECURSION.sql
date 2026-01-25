-- 1. Create a secure function to check admin status (Prevents recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
-- security definer allows the function to bypass RLS when checking the profile

-- 2. Drop existing policies on CATEGORIES to start fresh
DROP POLICY IF EXISTS "Public can read active categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can do everything on categories" ON public.categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable insert for admins only" ON public.categories;
DROP POLICY IF EXISTS "Enable update for admins only" ON public.categories;
DROP POLICY IF EXISTS "Enable delete for admins only" ON public.categories;

-- 3. Re-enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 4. Create Clean Policies using is_admin()

-- Policy: Public Read (Active Only)
CREATE POLICY "Public Read Active Categories"
ON public.categories
FOR SELECT
USING (is_active = true);

-- Policy: Admin Full Access (Select, Insert, Update, Delete)
CREATE POLICY "Admin Full Access Categories"
ON public.categories
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. Fix Profiles RLS Recursion as well (Optional but recommended)
-- We use the same is_admin() function to avoid the profile->profile loop
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin());
