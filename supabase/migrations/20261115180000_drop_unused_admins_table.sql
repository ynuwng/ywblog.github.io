-- Writes go through the Edge Function's admin key, so the Supabase Auth admin
-- path (empty admins table plus the policies that query it) is unused.
DROP POLICY IF EXISTS "Admins can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;
DROP TABLE IF EXISTS public.admins;
