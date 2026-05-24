-- Run this in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/ktdhmushfpfkfcbgqgqi/sql

-- Step 1: create the posts table
CREATE TABLE IF NOT EXISTS posts (
  id         TEXT        PRIMARY KEY,
  title      TEXT        NOT NULL,
  date       TEXT        NOT NULL,
  author     TEXT        NOT NULL,
  excerpt    TEXT        NOT NULL,
  read_time  TEXT        NOT NULL DEFAULT '5 min read',
  tags       TEXT[]      NOT NULL DEFAULT '{}',
  category   TEXT        NOT NULL DEFAULT 'Uncategorized',
  content    TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS posts_date_idx ON posts (date DESC);

-- Step 2: migrate existing data from the KV store
-- kv_store values have camelCase keys (readTime, not read_time)
INSERT INTO posts (id, title, date, author, excerpt, read_time, tags, category, content)
SELECT
  value->>'id',
  value->>'title',
  value->>'date',
  COALESCE(value->>'author',   'Unknown'),
  COALESCE(value->>'excerpt',  ''),
  COALESCE(value->>'readTime', '5 min read'),
  ARRAY(
    SELECT jsonb_array_elements_text(COALESCE(value->'tags', '[]'::jsonb))
  ),
  COALESCE(value->>'category', 'Uncategorized'),
  COALESCE(value->>'content',  '')
FROM kv_store_860c354e
WHERE key LIKE 'post:%'
  AND value->>'id' IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Step 3: verify the migration
-- SELECT count(*) FROM posts;

-- Step 4 (after verifying): clean up the old KV entries
-- DELETE FROM kv_store_860c354e WHERE key LIKE 'post:%';
