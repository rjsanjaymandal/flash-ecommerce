-- v3 Migration: Enterprise Notification Tracking
-- Run this in Supabase SQL Editor

-- 1. Add tracking column
alter table public.preorders 
add column if not exists notified_at timestamptz default null;

-- 2. Index for faster "Pending Notification" lookups
create index if not exists preorders_notified_idx on public.preorders (notified_at) where notified_at is null;

-- 3. Comments for clarity
comment on column public.preorders.notified_at is 'Timestamp when the back-in-stock notification was sent. Null means pending.';
