-- 1. Ensure is_admin function exists (idempotent check)
-- (This should have been created by FIX_RLS_RECURSION.sql, but we double check or recreate to be safe)
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

-- 2. PRODUCTS Table Policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Active Products" ON public.products;
DROP POLICY IF EXISTS "Admin Full Access Products" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for admins only" ON public.products;
DROP POLICY IF EXISTS "Enable update for admins only" ON public.products;
DROP POLICY IF EXISTS "Enable delete for admins only" ON public.products;

CREATE POLICY "Public Read Active Products"
ON public.products
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin Full Access Products"
ON public.products
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3. PRODUCT_STOCK Table Policies
ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Stock" ON public.product_stock;
DROP POLICY IF EXISTS "Admin Full Access Stock" ON public.product_stock;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.product_stock;

-- Public can read stock to show availability
CREATE POLICY "Public Read Stock"
ON public.product_stock
FOR SELECT
USING (true); 

CREATE POLICY "Admin Full Access Stock"
ON public.product_stock
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. ORDERS Table Policies (Prevent recursion here too)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;

CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin Full Access Orders"
ON public.orders
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());
