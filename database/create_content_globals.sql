-- Create a table for global content settings (Key-Value Store)
create table if not exists content_globals (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references auth.users(id)
);

-- Enable RLS
alter table content_globals enable row level security;

-- Policies
create policy "Public Read Access"
  on content_globals for select
  using (true);

create policy "Admin Update Access"
  on content_globals for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Seed Initial Data for Announcement Bar
insert into content_globals (key, value)
values (
  'announcement_bar',
  '{ "enabled": true, "text": "Welcome to Flash! Free shipping on orders over $150.", "href": "/shop" }'::jsonb
)
on conflict (key) do nothing;
