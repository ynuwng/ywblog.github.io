-- Review, then run as the database owner in the Supabase SQL editor.
-- The repository uses Edge Functions + a server-only service_role key for writes.
-- This intentionally removes direct Data API writes, including for logged-in users.
-- It preserves SELECT policies and does not delete data or administrator records.
BEGIN;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.posts FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.posts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.posts TO service_role;
DROP POLICY IF EXISTS "Public can read posts" ON public.posts;
CREATE POLICY "Public can read posts" ON public.posts
  FOR SELECT TO anon, authenticated USING (true);

DO $$
BEGIN
  IF to_regclass('public.admins') IS NOT NULL THEN
    ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON TABLE public.admins FROM PUBLIC, anon, authenticated;
  END IF;
  IF to_regclass('public.kv_store_860c354e') IS NOT NULL THEN
    ALTER TABLE public.kv_store_860c354e ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON TABLE public.kv_store_860c354e FROM PUBLIC, anon, authenticated;
  END IF;
END $$;
COMMIT;

-- Verify grants: posts should have only SELECT for anon/authenticated;
-- admins and the legacy KV table should have no grants for these roles.
SELECT table_name, grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name IN ('posts', 'admins', 'kv_store_860c354e')
  AND grantee IN ('PUBLIC', 'anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;

-- Verify row security is enabled for all present application tables.
SELECT relname, relrowsecurity
FROM pg_class
WHERE oid IN (to_regclass('public.posts'), to_regclass('public.admins'), to_regclass('public.kv_store_860c354e'));
