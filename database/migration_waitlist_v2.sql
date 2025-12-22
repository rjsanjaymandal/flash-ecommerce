-- v2 Migration to enable Guest Waitlist AND fix RLS issues
-- Run this in your Supabase SQL Editor

-- 1. Ensure is_admin() function exists and is correct
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 
    from public.profiles 
    where id = auth.uid() 
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 2. Drop potentially conflicting/broken policies on preorders
drop policy if exists "Admins can view all preorders" on public.preorders;
drop policy if exists "Users can create their own preorders" on public.preorders;
drop policy if exists "Users can view their own preorders" on public.preorders;
drop policy if exists "Guests can insert preorders" on public.preorders;

-- 3. Modify Schema (Safe if already run partially)
alter table public.preorders add column if not exists email text;
alter table public.preorders alter column user_id drop not null;

alter table public.preorders drop constraint if exists check_user_or_email;
alter table public.preorders add constraint check_user_or_email 
    check (user_id is not null or email is not null);

-- 4. Re-create Policies

-- Policy: Guests can insert (for joining waitlist)
create policy "Guests can insert preorders" 
on public.preorders 
for insert 
to anon 
with check (true);

-- Policy: Authenticated users can insert their own
create policy "Users can insert own preorders"
on public.preorders
for insert
to authenticated
with check (auth.uid() = user_id);

-- Policy: Authenticated users can view their own (by ID or Email match)
create policy "Users can view own preorders"
on public.preorders
for select
to authenticated
using ( auth.uid() = user_id );

-- Policy: Admins can view everything
create policy "Admins can view all preorders"
on public.preorders
for select
to authenticated
using ( public.is_admin() );

-- 5. Index
create index if not exists preorders_email_idx on public.preorders (email);
