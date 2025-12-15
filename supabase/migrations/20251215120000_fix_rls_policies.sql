-- Enable RLS on categories table if not already enabled
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;

-- Create policy to allow public read access to active categories
CREATE POLICY "Public can view active categories"
ON public.categories FOR SELECT
USING (true);

-- Also ensure products are readable
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
ON public.products FOR SELECT
USING (true);
