-- Create inquiries table for property inquiry tracking
-- Run in Supabase SQL Editor

CREATE TABLE public.inquiries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
    name text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    message text,
    status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed'))
);

-- Indexes for common queries
CREATE INDEX idx_inquiries_property_id ON public.inquiries(property_id);
CREATE INDEX idx_inquiries_status ON public.inquiries(status);
CREATE INDEX idx_inquiries_created_at ON public.inquiries(created_at);

-- Enable Row Level Security
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to submit inquiries (form submissions)
CREATE POLICY "Enable insert for anon" ON public.inquiries
    FOR INSERT TO anon WITH CHECK (true);

-- Allow authenticated admins to read all inquiries
CREATE POLICY "Enable read for admin" ON public.inquiries
    FOR SELECT TO authenticated USING (
        (auth.jwt() -> 'app_metadata' ->> 'claims_admin')::boolean = true
    );

-- Allow authenticated admins to update inquiry status
CREATE POLICY "Enable update for admin" ON public.inquiries
    FOR UPDATE TO authenticated USING (
        (auth.jwt() -> 'app_metadata' ->> 'claims_admin')::boolean = true
    )
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'claims_admin')::boolean = true
    );