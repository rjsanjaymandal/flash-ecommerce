-- v4 Migration: Anonymous Guest Support
-- Run this in Supabase SQL Editor

-- 1. Add guest_id column for anonymous tracking (Device ID / Cookie ID)
ALTER TABLE public.preorders 
ADD COLUMN IF NOT EXISTS guest_id text;

-- 2. Update Constraints to allow entry if guest_id is present (even if email is null)
ALTER TABLE public.preorders DROP CONSTRAINT IF EXISTS check_user_or_email;

ALTER TABLE public.preorders ADD CONSTRAINT check_waitlist_identifier 
    CHECK (user_id IS NOT NULL OR email IS NOT NULL OR guest_id IS NOT NULL);

-- 3. Add Index for guest_id
CREATE INDEX IF NOT EXISTS idx_preorders_guest_id ON public.preorders(guest_id);
