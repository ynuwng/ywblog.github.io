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
