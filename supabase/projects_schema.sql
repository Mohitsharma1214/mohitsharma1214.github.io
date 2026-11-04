-- ==============================================================================
-- SUPABASE DATABASE SCHEMA FOR MOHIT SHARMA'S PROJECTS & CASE STUDIES
-- ==============================================================================
-- Run this script in your Supabase SQL Editor:
-- 1. Go to https://supabase.com/dashboard/project/zxovekhtcajtefedkkee/sql
-- 2. Paste and run this script to create the projects table and RLS policies.
-- ==============================================================================

-- 1. Create the projects table
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

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects (featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects (category);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Public can view all projects
DROP POLICY IF EXISTS "Public can view all projects" ON public.projects;
CREATE POLICY "Public can view all projects" 
ON public.projects 
FOR SELECT 
USING (true);

-- Only the authorized site owner can perform write actions (insert, update, delete)
DROP POLICY IF EXISTS "Authenticated users have full write access to projects" ON public.projects;
DROP POLICY IF EXISTS "Only site owner can manage projects" ON public.projects;

CREATE POLICY "Only site owner can manage projects" 
ON public.projects 
FOR ALL 
TO authenticated 
USING (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com')
WITH CHECK (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com');
