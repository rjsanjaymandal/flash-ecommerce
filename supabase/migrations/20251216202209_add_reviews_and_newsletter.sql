-- 1. Reviews Table (Safe Create)
drop table if exists public.reviews cascade;
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  user_name text -- distinct from auth table to allow "display name"
);

-- Enable RLS
alter table public.reviews enable row level security;

-- Policy: Reviews are viewable by everyone
drop policy if exists "Reviews are viewable by everyone" on public.reviews;
create policy "Reviews are viewable by everyone" on public.reviews
  for select using (true);

-- Policy: Users can insert their own reviews
drop policy if exists "Users can insert their own reviews" on public.reviews;
create policy "Users can insert their own reviews" on public.reviews
  for insert with check (auth.uid() = user_id);

-- Policy: Admins can delete reviews
drop policy if exists "Admins can delete reviews" on public.reviews;
create policy "Admins can delete reviews" on public.reviews
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- 2. Newsletter Table
create table if not exists public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text unique not null
);

-- Enable RLS
alter table public.newsletter_subscribers enable row level security;

-- Policy: Anyone can subscribe (insert only)
drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;
create policy "Anyone can subscribe" on public.newsletter_subscribers
  for insert with check (true);

-- Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';
