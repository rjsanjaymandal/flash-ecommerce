-- Create the 'concepts' storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('concepts', 'concepts', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow Public Read Access
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'concepts' );

-- Policy: Allow Admin to Upload (Insert)
CREATE POLICY "Admin Insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( 
    bucket_id = 'concepts' 
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy: Allow Admin to Update
CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( 
    bucket_id = 'concepts' 
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy: Allow Admin to Delete
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( 
    bucket_id = 'concepts' 
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
