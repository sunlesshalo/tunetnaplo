-- Setup Supabase Storage for photos and voice notes
-- Run this in Supabase SQL Editor

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('symptom-photos', 'symptom-photos', false),
  ('voice-notes', 'voice-notes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for symptom-photos bucket
-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload their own symptom photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'symptom-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own photos
CREATE POLICY "Users can view their own symptom photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'symptom-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own symptom photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'symptom-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policies for voice-notes bucket
CREATE POLICY "Users can upload their own voice notes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'voice-notes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own voice notes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'voice-notes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own voice notes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'voice-notes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Update entries table to include photos and voice notes
ALTER TABLE public.entries
ADD COLUMN IF NOT EXISTS photos TEXT[], -- Array of storage paths
ADD COLUMN IF NOT EXISTS voice_note TEXT; -- Single voice note path per entry

-- Add comment explaining the columns
COMMENT ON COLUMN public.entries.photos IS 'Array of Supabase Storage paths to symptom photos';
COMMENT ON COLUMN public.entries.voice_note IS 'Supabase Storage path to voice note recording';
