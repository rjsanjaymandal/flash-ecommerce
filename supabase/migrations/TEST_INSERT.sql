-- TEST DIRECT INSERTION
-- Please run this in your Supabase SQL Editor.

INSERT INTO public.categories (name, slug, is_active)
VALUES ('Test Category SQL', 'test-category-sql', true);

-- If this runs successfully (shows "Success" or "Rows affected: 1"), 
-- then your Database is FINE, and the issue is in the Next.js App.

-- If this hangs or fails, your Database Table is LOCKED or BROKEN.
