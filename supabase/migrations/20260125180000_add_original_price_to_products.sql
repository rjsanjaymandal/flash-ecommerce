-- Add original_price column to products table
ALTER TABLE public.products 
ADD COLUMN original_price numeric DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.products.original_price IS 'The original manufacturer price (MRP) before any discount. Null if no discount.';
