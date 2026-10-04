-- Migration: Enable RLS safely on inquiries table and permit insert for both anon and authenticated users
-- Drop restrictive anon-only insert policy if it exists
DROP POLICY IF EXISTS "Enable insert for anon" ON public.inquiries;
DROP POLICY IF EXISTS "Enable insert for all" ON public.inquiries;

-- Allow both anonymous visitors and authenticated users to submit inquiries
CREATE POLICY "Enable insert for all" ON public.inquiries
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Ensure admins can read all inquiries
DROP POLICY IF EXISTS "Enable read for admin" ON public.inquiries;
CREATE POLICY "Enable read for admin" ON public.inquiries
    FOR SELECT TO authenticated USING (
        (auth.jwt() -> 'app_metadata' ->> 'claims_admin')::boolean = true
    );

-- Ensure admins can update inquiries (e.g. status)
DROP POLICY IF EXISTS "Enable update for admin" ON public.inquiries;
CREATE POLICY "Enable update for admin" ON public.inquiries
    FOR UPDATE TO authenticated USING (
        (auth.jwt() -> 'app_metadata' ->> 'claims_admin')::boolean = true
    )
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'claims_admin')::boolean = true
    );

-- Ensure admins can delete inquiries
DROP POLICY IF EXISTS "Enable delete for admin" ON public.inquiries;
CREATE POLICY "Enable delete for admin" ON public.inquiries
    FOR DELETE TO authenticated USING (
        (auth.jwt() -> 'app_metadata' ->> 'claims_admin')::boolean = true
    );

-- Enable Row Level Security
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
