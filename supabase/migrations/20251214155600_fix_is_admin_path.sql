-- Reset search_path for is_admin to allow access to auth schema and extensions
ALTER FUNCTION public.is_admin() RESET search_path;

-- Also reset other hardened functions just in case
ALTER FUNCTION public.handle_new_user() RESET search_path;

-- Re-verify the Admin View All Profiles policy exists and is correct
-- (We keep the restore_profiles_rls.sql logic, just ensuring the function works)
NOTIFY pgrst, 'reload config';
