-- ==============================================================================
-- SUPABASE DATABASE SCHEMA FOR MOHIT SHARMA'S BLOG CATEGORIES
-- ==============================================================================
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zxovekhtcajtefedkkee/sql
-- ==============================================================================

-- 1. Create the blog_categories table
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- 3. Set access policies
-- Public can read all categories
DROP POLICY IF EXISTS "Public can view blog categories" ON public.blog_categories;
CREATE POLICY "Public can view blog categories" 
ON public.blog_categories 
FOR SELECT 
USING (true);

-- Only the authorized site owner can perform write actions (insert, update, delete)
DROP POLICY IF EXISTS "Authenticated users have full write access to blog categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Only site owner can manage blog categories" ON public.blog_categories;

CREATE POLICY "Only site owner can manage blog categories" 
ON public.blog_categories 
FOR ALL 
TO authenticated 
USING (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com')
WITH CHECK (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com');

-- 4. Seed initial categories from current database articles
INSERT INTO public.blog_categories (id, name)
VALUES
    ('agentic-ai-test-automation', 'Agentic AI & Test Automation'),
    ('computer-vision-edge-ai', 'Computer Vision & Edge AI'),
    ('generative-ai-llm-engineering', 'Generative AI & LLM Engineering'),
    ('llm-systems-information-retrieval', 'LLM Systems & Information Retrieval'),
    ('machine-learning-deep-learning', 'Machine Learning & Deep Learning'),
    ('ml-hardware-optimization', 'ML Hardware & Optimization'),
    ('mlops-ai-deployment', 'MLOps & AI Deployment'),
    ('mlops-high-throughput-inference', 'MLOps & High-Throughput Inference'),
    ('production-platforms-recsys', 'Production Platforms & RecSys')
ON CONFLICT (id) DO NOTHING;
