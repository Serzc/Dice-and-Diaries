-- =====================================================================
-- Migration 004 – Storage policies for image uploads
-- Run in the Supabase SQL editor.
-- Requires the two buckets to already exist:
--   character-images  (public: ON)
--   campaign-images   (public: ON)
-- =====================================================================

-- character-images: allow anon to upload and read
CREATE POLICY "anon can upload character images"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'character-images');

CREATE POLICY "anon can update character images"
  ON storage.objects FOR UPDATE
  TO anon
  USING (bucket_id = 'character-images');

CREATE POLICY "public can read character images"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'character-images');

-- campaign-images: allow anon to upload and read
CREATE POLICY "anon can upload campaign images"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'campaign-images');

CREATE POLICY "anon can update campaign images"
  ON storage.objects FOR UPDATE
  TO anon
  USING (bucket_id = 'campaign-images');

CREATE POLICY "public can read campaign images"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'campaign-images');
