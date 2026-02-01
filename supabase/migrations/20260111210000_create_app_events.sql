-- Create app_events table for Async Architecture
create table if not exists app_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text,
  retry_count int default 0
);

-- Index for faster worker polling
create index if not exists idx_app_events_status on app_events(status, created_at) where status = 'PENDING';

-- RLS: Only service role can access this (backend only)
alter table app_events enable row level security;

DROP POLICY IF EXISTS "Service Role Full Access" ON app_events;
create policy "Service Role Full Access"
on app_events
for all
using ( auth.role() = 'service_role' );
