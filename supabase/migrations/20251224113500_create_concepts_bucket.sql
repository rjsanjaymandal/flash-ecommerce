-- Create the 'concepts' storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('concepts', 'concepts', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow Public Read Access
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'concepts' );

-- Policy: Allow Admin to Upload (Insert)
DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
CREATE POLICY "Admin Insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( 
    bucket_id = 'concepts' 
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy: Allow Admin to Update
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( 
    bucket_id = 'concepts' 
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy: Allow Admin to Delete
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( 
    bucket_id = 'concepts' 
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
