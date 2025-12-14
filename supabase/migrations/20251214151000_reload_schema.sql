-- 1. Reload the schema cache explicitly
NOTIFY pgrst, 'reload config';

-- 2. Double check the FK exists (this is a fast no-op if already present)
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
