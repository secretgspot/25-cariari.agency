-- Add forward_inquiries_to_realtor column if missing
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS forward_inquiries_to_realtor boolean DEFAULT false;

-- Fix policies for site_settings
DROP POLICY IF EXISTS "Enable read for admin" ON public.site_settings;
DROP POLICY IF EXISTS "Enable read for all" ON public.site_settings;

CREATE POLICY "Enable read for all" 
ON public.site_settings 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- Ensure default row exists
INSERT INTO public.site_settings (id, site_name, site_tagline, contact_email, contact_phone, office_address, default_agent_email, forward_inquiries_to_realtor)
VALUES (
    1,
    'Cariari Agency',
    'Costa Rica Real Estate',
    'info@cariari.agency',
    '+506 2222-2222',
    'San José, Costa Rica',
    'agent@cariari.agency',
    false
)
ON CONFLICT (id) DO NOTHING;

-- Ensure admin has full update rights
DROP POLICY IF EXISTS "Enable update for admin" ON public.site_settings;
CREATE POLICY "Enable update for admin" 
ON public.site_settings 
FOR UPDATE 
TO authenticated 
USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'claims_admin'::text))::boolean = true)
WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'claims_admin'::text))::boolean = true);

-- Ensure admin has insert rights if needed
DROP POLICY IF EXISTS "Enable insert for admin" ON public.site_settings;
CREATE POLICY "Enable insert for admin" 
ON public.site_settings 
FOR INSERT 
TO authenticated 
WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'claims_admin'::text))::boolean = true);
