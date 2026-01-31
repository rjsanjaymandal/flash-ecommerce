-- Migration: Fix Profile Trigger & Backfill
-- Purpose: Ensure every Auth User has a corresponding Public Profile.

-- 1. Ensure the trigger function exists (redundant but safe)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User'),
    new.email,
    'user'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = CASE 
      WHEN public.profiles.name = 'User' OR public.profiles.name IS NULL THEN EXCLUDED.name 
      ELSE public.profiles.name 
    END,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create the Trigger on auth.users
-- We drop it first to avoid duplicates if it was named differently or broken
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Backfill missing profiles
-- Insert a profile for any user in auth.users that doesn't have one in public.profiles
INSERT INTO public.profiles (id, email, name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'User'),
    'user'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 4. Sync Emails (if missing)
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');
