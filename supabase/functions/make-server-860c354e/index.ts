import { Hono } from "npm:hono@4.13.13";
import { cors } from "npm:hono@4.13.13/cors";
import { logger } from "npm:hono@4.13.13/logger";
import { bodyLimit } from "npm:hono@4.13.13/body-limit";
import { createClient } from "jsr:@supabase/supabase-js@2.87.1";

const app = new Hono();
const PUBLIC_CACHE = "public, max-age=60, s-maxage=600, stale-while-revalidate=86400";

let db: ReturnType<typeof createClient> | null = null;

function getDB() {
  if (db) return db;
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return db;
}

async function requireAdmin(c: any) {
  c.header("Cache-Control", "no-store");
  const expected = Deno.env.get("BLOG_ADMIN_KEY") || Deno.env.get("ADMIN_KEY");
  if (!expected || expected.length < 32) {
    return c.json({ success: false, error: "Admin writes are not configured" }, 503);
  }

  const actual = c.req.header("x-admin-key");
  // Hash both values before comparing so comparison work has a fixed length.
  const digest = (value: string) => crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  const [wanted, received] = await Promise.all([digest(expected), digest(actual ?? "")]);
  const a = new Uint8Array(wanted);
  const b = new Uint8Array(received);
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  if (!actual || difference !== 0) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }

  return null;
}

// DB rows use snake_case; the frontend contract uses camelCase readTime.
function toPost(row: Record<string, unknown>) {
  const { id, title, date, author, excerpt, tags, category, content, read_time } = row;
  return { id, title, date, author, excerpt, tags, category, content, readTime: read_time };
}

if (Deno.env.get("LOG_REQUESTS") === "true") {
  app.use('*', logger(console.log));
}

// CORS limits browser access; the admin key remains mandatory for every write.
const adminOrigins = new Set((Deno.env.get("BLOG_ADMIN_ORIGINS") ?? "http://localhost:3000,http://127.0.0.1:3000")
  .split(",").map(origin => origin.trim()).filter(Boolean));
app.use("/*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  c.header("X-Content-Type-Options", "nosniff");
  const requestedMethod = c.req.method === "OPTIONS"
    ? c.req.header("Access-Control-Request-Method") : c.req.method;
  const publicRead = requestedMethod === "GET" || requestedMethod === "HEAD";
  return cors({
    origin: publicRead ? "*" : (origin) => adminOrigins.has(origin) ? origin : undefined,
    allowHeaders: ["Content-Type", "Authorization", "x-admin-key"],
    allowMethods: publicRead ? ["GET", "HEAD", "OPTIONS"] : ["POST", "PUT", "DELETE", "OPTIONS"],
    maxAge: 600,
  })(c, next);
});

// Authenticate before reading/parsing request bodies or querying the database.
app.use("/make-server-860c354e/posts*", async (c, next) => {
  if (["POST", "PUT", "DELETE"].includes(c.req.method)) {
    const unauthorized = await requireAdmin(c);
    if (unauthorized) return unauthorized;
  }
  await next();
});
app.use("/*", bodyLimit({
  maxSize: 1024 * 1024,
  onError: (c) => c.json({ success: false, error: "Request body too large" }, 413),
}));
app.onError((error, c) => {
  console.error("Request failed:", error);
  return c.json({ success: false, error: "Internal server error" }, 500);
});

const POST_COLUMNS = "id, title, date, author, excerpt, read_time, tags, category, content";
const stringLimits: Record<string, number> = {
  title: 300, date: 10, author: 200, excerpt: 5000,
  readTime: 100, category: 200, content: 900000,
};

class InvalidPost extends Error {}

// Reject unknown keys, wrong types, oversized fields and impossible dates.
async function readPost(c: any, partial = false): Promise<Record<string, unknown>> {
  if (!(c.req.header("Content-Type") ?? "").toLowerCase().startsWith("application/json")) {
    throw new InvalidPost("Content-Type must be application/json");
  }
  let body: unknown;
  try { body = await c.req.json(); } catch { throw new InvalidPost("Invalid JSON body"); }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new InvalidPost("Expected a JSON object");
  const fields = body as Record<string, unknown>;
  if (!Object.keys(fields).length) throw new InvalidPost("No post fields supplied");
  const patch: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (key === "tags") {
      if (!Array.isArray(value) || value.length > 50 || value.some(tag => typeof tag !== "string" || !tag.trim() || tag.length > 100)) {
        throw new InvalidPost("tags must contain at most 50 nonempty strings of at most 100 characters");
      }
    } else {
      if (!Object.hasOwn(stringLimits, key)) throw new InvalidPost("Unknown post field");
      if (typeof value !== "string" || value.length > stringLimits[key]) throw new InvalidPost("Invalid post field type or length");
      if (["title", "date", "author", "excerpt", "content"].includes(key) && !value.trim()) throw new InvalidPost("Required post fields cannot be empty");
      if (key === "date" && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) {
        throw new InvalidPost("date must be a valid YYYY-MM-DD date");
      }
    }
    patch[key === "readTime" ? "read_time" : key] = value;
  }
  if (!partial) {
    for (const key of ["title", "date", "author", "excerpt", "content"]) {
      if (!(key in patch)) throw new InvalidPost("Missing required post fields");
    }
    patch.read_time ??= "5 min read";
    patch.tags ??= [];
    patch.category ??= "Uncategorized";
  }
  return patch;
}

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
    c.header("Cache-Control", PUBLIC_CACHE);
    return c.json({ success: true, posts: (data ?? []).map(toPost) });
  } catch (error) {
    console.log("Error fetching posts:", error);
    return c.json({ success: false, error: "Unable to fetch posts" }, 500);
  }
});

app.get("/make-server-860c354e/posts/:id", async (c) => {
  try {
    const { data, error } = await getDB()
      .from("posts")
      .select(POST_COLUMNS)
      .eq("id", c.req.param("id"))
      .maybeSingle();

    if (error) throw error;
    if (!data) return c.json({ success: false, error: "Post not found" }, 404);
    c.header("Cache-Control", PUBLIC_CACHE);
    return c.json({ success: true, post: toPost(data) });
  } catch (error) {
    console.log("Error fetching post:", error);
    return c.json({ success: false, error: "Unable to complete request" }, 500);
  }
});

app.post("/make-server-860c354e/posts", async (c) => {
  try {
    const post = await readPost(c);
    const { data, error } = await getDB()
      .from("posts")
      .insert({ id: crypto.randomUUID(), ...post })
      .select(POST_COLUMNS)
      .single();

    if (error) throw error;
    return c.json({ success: true, post: toPost(data) });
  } catch (error) {
    if (error instanceof InvalidPost) return c.json({ success: false, error: error.message }, 400);
    console.log("Error creating post:", error);
    return c.json({ success: false, error: "Unable to complete request" }, 500);
  }
});

app.put("/make-server-860c354e/posts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = getDB();

    const { data: existing, error: lookupError } = await db.from("posts").select("id").eq("id", id).maybeSingle();
    if (lookupError) throw lookupError;
    if (!existing) return c.json({ success: false, error: "Post not found" }, 404);

    const patch = await readPost(c, true);

    const { data, error } = await db
      .from("posts")
      .update(patch)
      .eq("id", id)
      .select(POST_COLUMNS)
      .single();

    if (error) throw error;
    return c.json({ success: true, post: toPost(data) });
  } catch (error) {
    if (error instanceof InvalidPost) return c.json({ success: false, error: error.message }, 400);
    console.log("Error updating post:", error);
    return c.json({ success: false, error: "Unable to complete request" }, 500);
  }
});

app.delete("/make-server-860c354e/posts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = getDB();

    const { data: existing, error: lookupError } = await db.from("posts").select("id").eq("id", id).maybeSingle();
    if (lookupError) throw lookupError;
    if (!existing) return c.json({ success: false, error: "Post not found" }, 404);

    const { error } = await db.from("posts").delete().eq("id", id);
    if (error) throw error;

    return c.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error deleting post:", error);
    return c.json({ success: false, error: "Unable to complete request" }, 500);
  }
});

Deno.serve(app.fetch);
