-- ==============================================================================
-- SUPABASE DATABASE SCHEMA FOR MOHIT SHARMA'S BLOGS
-- ==============================================================================
-- Run this script in your Supabase SQL Editor:
-- 1. Go to https://supabase.com/dashboard/project/_/sql
-- 2. Paste and run this script to create the table, indexes, and security policies.
-- ==============================================================================

-- 1. Create the blogs table
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

-- 2. Create performance indexes for high-throughput pagination & search
CREATE INDEX IF NOT EXISTS idx_blogs_published_created ON public.blogs (published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blogs (category);
CREATE INDEX IF NOT EXISTS idx_blogs_title_search ON public.blogs USING gin (to_tsvector('english', title || ' ' || summary));

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- 4. Set access policies
-- Public users can read all published blogs
DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;
CREATE POLICY "Public can view published blogs" 
ON public.blogs 
FOR SELECT 
USING (published = true);

-- Only the authorized site owner can perform write actions (insert, update, delete)
DROP POLICY IF EXISTS "Authenticated users have full write access" ON public.blogs;
DROP POLICY IF EXISTS "Only site owner can manage blogs" ON public.blogs;

CREATE POLICY "Only site owner can manage blogs"
ON public.blogs
FOR ALL
TO authenticated
USING (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com')
WITH CHECK (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com');
