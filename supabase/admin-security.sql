-- ==============================================================================
-- COMPREHENSIVE SUPABASE RLS SECURITY LOCKDOWN
-- Secures all tables & storage buckets strictly to: mohitxsharma09@gmail.com
-- ==============================================================================
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zxovekhtcajtefedkkee/sql
-- ==============================================================================

-- 1. SECURE BLOGS TABLE
ALTER TABLE IF EXISTS public.blogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users have full write access" ON public.blogs;
DROP POLICY IF EXISTS "Only site owner can manage blogs" ON public.blogs;

CREATE POLICY "Only site owner can manage blogs"
ON public.blogs
FOR ALL
TO authenticated
USING (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com')
WITH CHECK (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com');

-- 2. SECURE PROJECTS TABLE
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users have full write access to projects" ON public.projects;
DROP POLICY IF EXISTS "Only site owner can manage projects" ON public.projects;

CREATE POLICY "Only site owner can manage projects"
ON public.projects
FOR ALL
TO authenticated
USING (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com')
WITH CHECK (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com');

-- 3. SECURE SITE SETTINGS TABLE
ALTER TABLE IF EXISTS public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users have full write access to site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Only site owner can manage site settings" ON public.site_settings;

CREATE POLICY "Only site owner can manage site settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com')
WITH CHECK (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com');

-- 4. SECURE BLOG CATEGORIES TABLE
ALTER TABLE IF EXISTS public.blog_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users have full write access to blog categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Only site owner can manage blog categories" ON public.blog_categories;

CREATE POLICY "Only site owner can manage blog categories"
ON public.blog_categories
FOR ALL
TO authenticated
USING (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com')
WITH CHECK (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com');

-- 5. SECURE INQUIRIES & AI LEADS TABLE
ALTER TABLE IF EXISTS public.inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public / visitors / AI agent to insert new inquiries only
DROP POLICY IF EXISTS "Anyone can insert inquiries" ON public.inquiries;
CREATE POLICY "Anyone can insert inquiries" 
ON public.inquiries 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Revoke public read access (protect visitor contact data & messages)
DROP POLICY IF EXISTS "Public read fallback" ON public.inquiries;
DROP POLICY IF EXISTS "Authenticated users have full access to inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Only site owner can read and manage inquiries" ON public.inquiries;

-- Only Mohit can view, update, or delete incoming inquiries
CREATE POLICY "Only site owner can read and manage inquiries"
ON public.inquiries
FOR ALL
TO authenticated
USING (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com')
WITH CHECK (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com');

-- 6. SECURE STORAGE (blog-images bucket)
DROP POLICY IF EXISTS "Authenticated Owner Can Upload Blog Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Owner Can Update Blog Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Owner Can Delete Blog Images" ON storage.objects;

CREATE POLICY "Authenticated Owner Can Upload Blog Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images'
  AND lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com'
);

CREATE POLICY "Authenticated Owner Can Update Blog Images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com'
);

CREATE POLICY "Authenticated Owner Can Delete Blog Images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com'
);
