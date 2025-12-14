-- Add Foreign Key if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_user_id_fkey'
  ) THEN
    ALTER TABLE public.orders
    ADD CONSTRAINT orders_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Drop and re-create to ensure it's correct if the name was different
-- (Optional: safest way is just ensuring the constraint exists)

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
