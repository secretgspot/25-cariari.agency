-- Migration: Drop Obsolete Storage Deletion Triggers
-- Date: 2026-09-09
-- Purpose: Fix property deletion failure caused by PostgreSQL error 42501
-- ("Direct deletion from storage tables is not allowed. Use the Storage API instead.")
-- Supabase locked down direct SQL deletes on storage.objects; photo cleanup is handled
-- via Supabase Storage API in the application layer.

-- 1. Drop the triggers that attempted direct SQL deletes on storage.objects
DROP TRIGGER IF EXISTS delete_photos_from_bucket ON public.properties;
DROP TRIGGER IF EXISTS trigger_delete_photo_storage ON public.photos;

-- 2. Drop obsolete trigger functions
DROP FUNCTION IF EXISTS public.delete_photos();
DROP FUNCTION IF EXISTS public.delete_photos_by_msl();
DROP FUNCTION IF EXISTS public.delete_photo_storage();
