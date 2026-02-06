-- Migration: Remove Barcode Permanently
-- Description: Drops 'barcode' columns from products and product_stock as they are no longer used in the UI or code.

-- 1. Remove from products
ALTER TABLE public.products DROP COLUMN IF EXISTS barcode;

-- 2. Remove from product_stock
ALTER TABLE public.product_stock DROP COLUMN IF EXISTS barcode;
