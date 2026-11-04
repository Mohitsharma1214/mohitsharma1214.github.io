-- ==============================================================================
-- COMPREHENSIVE SUPABASE RLS SECURITY LOCKDOWN
-- Secures all tables & storage buckets strictly to: mohitxsharma09@gmail.com
-- Safely creates tables if they do not exist, then applies strict RLS policies.
-- ==============================================================================
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zxovekhtcajtefedkkee/sql
-- ==============================================================================

-- 1. SECURE BLOGS TABLE
CREATE TABLE IF NOT EXISTS public.blogs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'Engineering',
    read_time TEXT NOT NULL DEFAULT '5 min read',
    status TEXT NOT NULL DEFAULT 'Published Breakdown',
    cover_image TEXT,
    publish_date TEXT NOT NULL DEFAULT 'Oct 2026',
    summary TEXT NOT NULL DEFAULT '',
    content_markdown TEXT NOT NULL DEFAULT '',
    published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;
CREATE POLICY "Public can view published blogs" 
ON public.blogs FOR SELECT 
USING (published = true);

DROP POLICY IF EXISTS "Authenticated users have full write access" ON public.blogs;
DROP POLICY IF EXISTS "Only site owner can manage blogs" ON public.blogs;

CREATE POLICY "Only site owner can manage blogs"
ON public.blogs
FOR ALL
TO authenticated
USING (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com')
WITH CHECK (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com');


-- 2. SECURE PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'Computer Vision & Edge',
    problem_statement TEXT NOT NULL DEFAULT '',
    solution TEXT NOT NULL DEFAULT '',
    technologies JSONB NOT NULL DEFAULT '[]'::jsonb,
    metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
    featured BOOLEAN NOT NULL DEFAULT false,
    repo_url TEXT,
    demo_url TEXT,
    doc_url TEXT,
    is_proprietary BOOLEAN NOT NULL DEFAULT false,
    cover_image TEXT,
    sections JSONB NOT NULL DEFAULT '{}'::jsonb,
    architecture_diagram_svg TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view all projects" ON public.projects;
CREATE POLICY "Public can view all projects" 
ON public.projects FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Authenticated users have full write access to projects" ON public.projects;
DROP POLICY IF EXISTS "Only site owner can manage projects" ON public.projects;

CREATE POLICY "Only site owner can manage projects"
ON public.projects
FOR ALL
TO authenticated
USING (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com')
WITH CHECK (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com');


-- 3. SECURE SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" 
ON public.site_settings FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Authenticated users have full write access to site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Only site owner can manage site settings" ON public.site_settings;

CREATE POLICY "Only site owner can manage site settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com')
WITH CHECK (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com');


-- 4. SECURE BLOG CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view blog categories" ON public.blog_categories;
CREATE POLICY "Public can view blog categories" 
ON public.blog_categories FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Authenticated users have full write access to blog categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Only site owner can manage blog categories" ON public.blog_categories;

CREATE POLICY "Only site owner can manage blog categories"
ON public.blog_categories
FOR ALL
TO authenticated
USING (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com')
WITH CHECK (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com');


-- 5. SECURE INQUIRIES & AI LEADS TABLE
CREATE TABLE IF NOT EXISTS public.inquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Website Visitor',
    email TEXT NOT NULL,
    topic TEXT DEFAULT 'General Inquiry',
    message TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'ai_agent',
    status TEXT NOT NULL DEFAULT 'unread',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public / visitors / AI agent to insert new inquiries only
DROP POLICY IF EXISTS "Anyone can insert inquiries" ON public.inquiries;
CREATE POLICY "Anyone can insert inquiries" 
ON public.inquiries 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Revoke public read access (protect visitor contact data and recruiter messages)
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
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
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
  END IF;
END $$;
