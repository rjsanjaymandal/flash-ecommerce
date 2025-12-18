-- Create preorders table for waitlist functionality
create table public.preorders (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  product_id uuid not null,
  user_id uuid not null,
  constraint preorders_pkey primary key (id),
  constraint preorders_product_id_fkey foreign key (product_id) references products (id) on delete cascade,
  constraint preorders_user_id_fkey foreign key (user_id) references profiles (id) on delete cascade
);

-- Enable RLS
alter table public.preorders enable row level security;

-- Policies
create policy "Users can create their own preorders"
on public.preorders
for insert
to authenticated
with check (true);

create policy "Users can view their own preorders"
on public.preorders
for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins can view all preorders"
on public.preorders
for select
to authenticated
using (
  exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Index for performance
create index preorders_product_id_idx on public.preorders (product_id);
create index preorders_user_id_idx on public.preorders (user_id);
