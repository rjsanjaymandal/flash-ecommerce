-- 1. Reviews Table
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  user_name text -- distinct from auth table to allow "display name"
);

-- Enable RLS
alter table public.reviews enable row level security;

-- Policy: Reviews are viewable by everyone
create policy "Reviews are viewable by everyone" on public.reviews
  for select using (true);

-- Policy: Users can insert their own reviews
create policy "Users can insert their own reviews" on public.reviews
  for insert with check (auth.uid() = user_id);


-- 2. Newsletter Table
create table if not exists public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text unique not null
);

-- Enable RLS
alter table public.newsletter_subscribers enable row level security;

-- Policy: Anyone can subscribe (insert only)
create policy "Anyone can subscribe" on public.newsletter_subscribers
  for insert with check (true);
