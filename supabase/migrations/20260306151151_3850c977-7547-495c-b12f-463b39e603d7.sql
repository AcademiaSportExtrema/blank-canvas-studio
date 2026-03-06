-- Create the uploads bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', false);

-- Allow authenticated users to upload files to their empresa folder
CREATE POLICY "Users upload to own empresa folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads'
  AND (storage.foldername(name))[1] = get_user_empresa_id(auth.uid())::text
);

-- Allow admins to read files from their empresa folder
CREATE POLICY "Admins read own empresa files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'uploads'
  AND (storage.foldername(name))[1] = get_user_empresa_id(auth.uid())::text
);

-- Allow admins to delete files from their empresa folder
CREATE POLICY "Admins delete own empresa files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'uploads'
  AND has_role(auth.uid(), 'admin'::app_role)
  AND (storage.foldername(name))[1] = get_user_empresa_id(auth.uid())::text
);

-- Super admins full access
CREATE POLICY "Super admins full access storage"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'uploads'
  AND has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  bucket_id = 'uploads'
  AND has_role(auth.uid(), 'super_admin'::app_role)
);