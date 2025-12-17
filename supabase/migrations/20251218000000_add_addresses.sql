create table if not exists public.addresses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  country text not null default 'India',
  phone text not null,
  is_default boolean default false
);

alter table public.addresses enable row level security;

create policy "Users can view their own addresses"
on public.addresses for select
using (auth.uid() = user_id);

create policy "Users can insert their own addresses"
on public.addresses for insert
with check (auth.uid() = user_id);

create policy "Users can update their own addresses"
on public.addresses for update
using (auth.uid() = user_id);

create policy "Users can delete their own addresses"
on public.addresses for delete
using (auth.uid() = user_id);

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
