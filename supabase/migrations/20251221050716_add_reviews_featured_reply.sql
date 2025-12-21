alter table public.reviews 
add column if not exists is_featured boolean default false,
add column if not exists reply_text text;
