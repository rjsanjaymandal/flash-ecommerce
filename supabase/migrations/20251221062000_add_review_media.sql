
alter table "public"."reviews" add column "media_urls" text[] default '{}'::text[];

-- Create storage bucket for reviews if not exists
insert into storage.buckets (id, name, public) 
values ('reviews', 'reviews', true)
on conflict (id) do nothing;

-- Allow public access to reviews bucket
create policy "Public Access Reviews"
  on storage.objects for select
  using ( bucket_id = 'reviews' );

-- Allow authenticated uploads
create policy "Authenticated Uploads Reviews"
  on storage.objects for insert
  with check ( bucket_id = 'reviews' and auth.role() = 'authenticated' );
