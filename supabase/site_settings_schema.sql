-- ==============================================================================
-- SUPABASE DATABASE SCHEMA FOR MOHIT SHARMA'S SITE SETTINGS & HIRING PROFILE
-- ==============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zxovekhtcajtefedkkee/sql
-- ==============================================================================

-- 1. Create site_settings key-value store
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Public can read settings (for resume link, calendly link, hiring status)
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Only the authorized site owner can perform write actions (insert, update)
DROP POLICY IF EXISTS "Authenticated users have full write access to site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Only site owner can manage site settings" ON public.site_settings;

CREATE POLICY "Only site owner can manage site settings" 
ON public.site_settings 
FOR ALL 
TO authenticated 
USING (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com')
WITH CHECK (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com');

-- 4. Seed default profile settings record
INSERT INTO public.site_settings (key, value)
VALUES (
    'profile_settings',
    '{
        "resumeUrl": "",
        "calendlyUrl": "https://cal.com/mohitsharma",
        "targetRoles": ["AI Engineer", "Computer Vision Specialist", "Production MLOps Engineer"],
        "noticePeriod": "Immediate / Short Notice",
        "locationPreference": "Bhopal, India • Open to Worldwide Remote & Relocation",
        "isAvailable": true
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
