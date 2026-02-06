-- Migration: Add Product Fit Variations
-- Description: Adds 'fit' (Regular, Oversized) as a third variation dimension.

-- 1. Add fit_options to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS fit_options text[] DEFAULT '{}';

-- 2. Add fit to product_stock table
ALTER TABLE public.product_stock 
ADD COLUMN IF NOT EXISTS fit text DEFAULT 'Regular';

-- 3. Add fit to cart_items table
ALTER TABLE public.cart_items 
ADD COLUMN IF NOT EXISTS fit text DEFAULT 'Regular';

-- 4. Add fit to order_items table
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS fit text DEFAULT 'Regular';

-- 5. Update Constraints
-- Update product_stock unique constraint
ALTER TABLE public.product_stock 
DROP CONSTRAINT IF EXISTS product_stock_product_id_size_color_key;

-- We need a nuevo unique constraint including fit
ALTER TABLE public.product_stock 
ADD CONSTRAINT product_stock_product_id_size_color_fit_key 
UNIQUE (product_id, size, color, fit);

-- Update cart_items unique constraint
ALTER TABLE public.cart_items 
DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_size_color_key;

ALTER TABLE public.cart_items 
ADD CONSTRAINT cart_items_user_id_product_id_size_color_fit_key 
UNIQUE (user_id, product_id, size, color, fit);

-- 6. Seed some default fit options for existing products (optional but good for consistency)
UPDATE public.products 
SET fit_options = '{"Regular", "Oversized"}' 
WHERE fit_options = '{}';
