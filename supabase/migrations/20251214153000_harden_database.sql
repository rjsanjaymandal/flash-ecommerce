-- 1. Secure Functions (Search Path Mutable Warning)
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
-- Assuming this exists per warning, harmless if not found in some postgres versions but let's wrap in DO block to be safe if strictly needed, 
-- but standar ALTER FUNCTION is usually fine. If update_updated_at_column is a trigger func:
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
  END IF;
END $$;


-- 2. Consolidate Policies (Multiple Permissive Policies Warning)

-- PRODUCTS
DROP POLICY IF EXISTS "Public Read Active Products" ON public.products;
DROP POLICY IF EXISTS "Admin Full Access Products" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;

CREATE POLICY "Unified Read Products"
ON public.products FOR SELECT
USING ( (is_active = true) OR (public.is_admin()) );

CREATE POLICY "Admin Write Products"
ON public.products FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- CATEGORIES
DROP POLICY IF EXISTS "Public Read Active Categories" ON public.categories;
DROP POLICY IF EXISTS "Admin Full Access Categories" ON public.categories;
DROP POLICY IF EXISTS "Public can read active categories" ON public.categories;

CREATE POLICY "Unified Read Categories"
ON public.categories FOR SELECT
USING ( (is_active = true) OR (public.is_admin()) );

CREATE POLICY "Admin Write Categories"
ON public.categories FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- ORDERS (Users view own OR Admins view all)
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admin Full Access Orders" ON public.orders;

CREATE POLICY "Unified Read Orders"
ON public.orders FOR SELECT
USING ( (auth.uid() = user_id) OR (public.is_admin()) );

CREATE POLICY "Users Create Own Orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin Write Orders"
ON public.orders FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- PRODUCT_STOCK
DROP POLICY IF EXISTS "Public Read Stock" ON public.product_stock;
DROP POLICY IF EXISTS "Admin Full Access Stock" ON public.product_stock;

-- Everyone can see stock count (for UI availability), Admins can write
CREATE POLICY "Unified Read Stock"
ON public.product_stock FOR SELECT
USING (true);

CREATE POLICY "Admin Write Stock"
ON public.product_stock FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- 3. Add Indexes (Unindexed foreign keys Warning)
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);

-- Check if order_items exists before indexing
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'order_items') THEN
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
  END IF;
END $$;
