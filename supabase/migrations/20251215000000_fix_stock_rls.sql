-- Enable RLS on product_stock (ensure it is enabled)
ALTER TABLE "product_stock" ENABLE ROW LEVEL SECURITY;

-- Allow public read access to product stock
-- This is necessary for the storefront to know which sizes/colors are available
CREATE POLICY "Allow public read of product_stock"
ON "product_stock"
FOR SELECT
TO public
USING (true);
