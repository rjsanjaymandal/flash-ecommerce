-- Future Lab Migration
-- 1. Create ENUM for concept status
DO $$ BEGIN
    CREATE TYPE public.concept_status AS ENUM ('voting', 'approved', 'launched');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create concepts table
create table if not exists public.concepts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text,
  vote_count integer default 0,
  vote_goal integer default 50,
  status public.concept_status default 'voting'::public.concept_status,
  created_at timestamptz default now()
);

-- 3. Create concept_votes table
create table if not exists public.concept_votes (
  user_id uuid references public.profiles(id) on delete cascade not null,
  concept_id uuid references public.concepts(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, concept_id)
);

-- 4. Enable RLS
alter table public.concepts enable row level security;
alter table public.concept_votes enable row level security;

-- 5. Policies for concepts
drop policy if exists "Public read concepts" on public.concepts;
create policy "Public read concepts" on public.concepts
  for select using (true);

drop policy if exists "Admin manage concepts" on public.concepts;
create policy "Admin manage concepts" on public.concepts
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 6. Policies for concept_votes
drop policy if exists "Public read votes" on public.concept_votes;
create policy "Public read votes" on public.concept_votes
  for select using (true);

drop policy if exists "Users insert own votes" on public.concept_votes;
create policy "Users insert own votes" on public.concept_votes
  for insert with check (auth.uid() = user_id);

drop policy if exists "Admin manage votes" on public.concept_votes;
create policy "Admin manage votes" on public.concept_votes
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
