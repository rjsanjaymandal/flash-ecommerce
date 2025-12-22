-- Migration to enable Guest Waitlist
-- Run this in your Supabase SQL Editor

-- 1. Add email column
alter table public.preorders add column if not exists email text;

-- 2. Make user_id nullable
alter table public.preorders alter column user_id drop not null;

-- 3. Add constraint to ensure we have at least one identifier
alter table public.preorders add constraint check_user_or_email 
    check (user_id is not null or email is not null);

-- 4. Allow guests (anon) to insert into preorders
create policy "Guests can insert preorders" 
on public.preorders 
for insert 
to anon 
with check (true);

-- 5. Index for email lookups
create index if not exists preorders_email_idx on public.preorders (email);
