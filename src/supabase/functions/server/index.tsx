import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

function getDB() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key);
}

function requireAdmin(c: any) {
  const expected = Deno.env.get("BLOG_ADMIN_KEY") || Deno.env.get("ADMIN_KEY");
  if (!expected) {
    return c.json({ success: false, error: "Admin writes are not configured" }, 503);
  }

  const actual = c.req.header("x-admin-key");
  if (actual !== expected) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }

  return null;
}

// DB rows use snake_case; the frontend contract uses camelCase readTime.
function toPost(row: Record<string, unknown>) {
  const { read_time, created_at: _ca, ...rest } = row as any;
  return { ...rest, readTime: read_time };
}

app.use('*', logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "x-admin-key"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get("/make-server-860c354e/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/make-server-860c354e/posts", async (c) => {
  try {
    const { data, error } = await getDB()
      .from("posts")
      // strip content — list view should not pay for full post bodies
      .select("id, title, date, author, excerpt, read_time, tags, category")
      .order("date", { ascending: false });

    if (error) throw error;
    return c.json({ success: true, posts: (data ?? []).map(toPost) });
  } catch (error) {
    console.log("Error fetching posts:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get("/make-server-860c354e/posts/:id", async (c) => {
  try {
    const { data, error } = await getDB()
      .from("posts")
      .select("*")
      .eq("id", c.req.param("id"))
      .maybeSingle();

    if (error) throw error;
    if (!data) return c.json({ success: false, error: "Post not found" }, 404);
    return c.json({ success: true, post: toPost(data) });
  } catch (error) {
    console.log("Error fetching post:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-860c354e/posts", async (c) => {
  try {
    const unauthorized = requireAdmin(c);
    if (unauthorized) return unauthorized;

    const { title, date, author, excerpt, readTime, tags, category, content } = await c.req.json();

    if (!title || !date || !author || !excerpt || !content) {
      return c.json({
        success: false,
        error: "Missing required fields: title, date, author, excerpt, content",
      }, 400);
    }

    const { data, error } = await getDB()
      .from("posts")
      .insert({
        id: crypto.randomUUID(),
        title,
        date,
        author,
        excerpt,
        read_time: readTime ?? "5 min read",
        tags: tags ?? [],
        category: category ?? "Uncategorized",
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return c.json({ success: true, post: toPost(data) });
  } catch (error) {
    console.log("Error creating post:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-860c354e/posts/:id", async (c) => {
  try {
    const unauthorized = requireAdmin(c);
    if (unauthorized) return unauthorized;

    const id = c.req.param("id");
    const db = getDB();

    const { data: existing } = await db.from("posts").select("id").eq("id", id).maybeSingle();
    if (!existing) return c.json({ success: false, error: "Post not found" }, 404);

    // readTime → read_time; drop id and created_at so they can't be overwritten
    const { readTime, id: _id, created_at: _ca, ...fields } = await c.req.json();
    const patch: Record<string, unknown> = { ...fields };
    if (readTime !== undefined) patch.read_time = readTime;

    const { data, error } = await db
      .from("posts")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return c.json({ success: true, post: toPost(data) });
  } catch (error) {
    console.log("Error updating post:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-860c354e/posts/:id", async (c) => {
  try {
    const unauthorized = requireAdmin(c);
    if (unauthorized) return unauthorized;

    const id = c.req.param("id");
    const db = getDB();

    const { data: existing } = await db.from("posts").select("id").eq("id", id).maybeSingle();
    if (!existing) return c.json({ success: false, error: "Post not found" }, 404);

    const { error } = await db.from("posts").delete().eq("id", id);
    if (error) throw error;

    return c.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error deleting post:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
