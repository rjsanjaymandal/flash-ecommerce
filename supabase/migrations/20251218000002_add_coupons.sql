-- Create type if it doesn't exist (handled by idempotency usually, but simple create is fine for now if new)
DO $$ BEGIN
    CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

create table if not exists coupons (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  code text not null unique,
  discount_type discount_type not null,
  value numeric not null, -- percentage (0-100) or fixed amount
  active boolean default true,
  max_uses integer,
  used_count integer default 0,
  expires_at timestamp with time zone,
  min_order_amount numeric default 0
);

-- RLS Policies
alter table coupons enable row level security;

-- Admins can do everything
create policy "Admins can do all on coupons"
  on coupons
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Users can read active coupons (for validation)
create policy "Anyone can read coupons"
  on coupons for select
  using (true);
