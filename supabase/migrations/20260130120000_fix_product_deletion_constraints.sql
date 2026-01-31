-- Fix order_items FK to allow product deletion (Set NULL to preserve order history)
ALTER TABLE public.order_items
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

ALTER TABLE public.order_items
ADD CONSTRAINT order_items_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE SET NULL;

-- Fix preorders (waitlist) FK to allow product deletion (Cascade delete)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'preorders') THEN
        ALTER TABLE public.preorders
        DROP CONSTRAINT IF EXISTS preorders_product_id_fkey;

        ALTER TABLE public.preorders
        ADD CONSTRAINT preorders_product_id_fkey
        FOREIGN KEY (product_id)
        REFERENCES public.products(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Fix product_stock FK just in case (Cascade)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_stock') THEN
         ALTER TABLE public.product_stock
         DROP CONSTRAINT IF EXISTS product_stock_product_id_fkey;

         ALTER TABLE public.product_stock
         ADD CONSTRAINT product_stock_product_id_fkey
         FOREIGN KEY (product_id)
         REFERENCES public.products(id)
         ON DELETE CASCADE;
    END IF;
END $$;
