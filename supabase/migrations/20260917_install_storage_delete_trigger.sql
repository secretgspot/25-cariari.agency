-- Migration: Install Storage Delete Trigger with allow_delete_query
-- Date: 2026-09-17
-- Purpose: Automatically clean up storage.objects when a property is deleted
-- Uses storage.allow_delete_query to bypass protect_delete() exception

CREATE OR REPLACE FUNCTION public.delete_photos_from_bucket() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- Set session setting to allow deleting from storage.objects table
    PERFORM set_config('storage.allow_delete_query', 'true', true);
    DELETE FROM storage.objects 
    WHERE bucket_id = 'photos' 
      AND (name LIKE format('%s/%%', OLD.msl));
    RETURN OLD;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Could not delete storage objects for MSL %: %', OLD.msl, SQLERRM;
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS delete_photos_from_bucket ON public.properties;

CREATE TRIGGER delete_photos_from_bucket
AFTER DELETE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.delete_photos_from_bucket();
