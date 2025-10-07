-- Fix photos column to be TEXT[] array type
-- Run this in Supabase SQL Editor

-- First, drop the existing column if it's the wrong type
ALTER TABLE public.entries DROP COLUMN IF EXISTS photos;

-- Add it back as TEXT[] array
ALTER TABLE public.entries ADD COLUMN photos TEXT[];

-- Add comment
COMMENT ON COLUMN public.entries.photos IS 'Array of Supabase Storage paths to symptom photos';
