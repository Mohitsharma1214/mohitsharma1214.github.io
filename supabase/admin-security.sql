-- ==============================================================================
-- SUPABASE SECURITY PATCH: RESTRICT BLOG WRITES TO SITE OWNER
-- ==============================================================================
-- Run this migration in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zxovekhtcajtefedkkee/sql
-- ==============================================================================

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users have full write access" ON public.blogs;
DROP POLICY IF EXISTS "Only site owner can manage blogs" ON public.blogs;

CREATE POLICY "Only site owner can manage blogs"
ON public.blogs
FOR ALL
TO authenticated
USING (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com')
WITH CHECK (lower(auth.jwt() ->> 'email') = 'mohitxsharma09@gmail.com');
