import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-860c354e/health", (c) => {
  return c.json({ status: "ok" });
});

// Blog Post Routes

// Get all blog posts (summary only)
app.get("/make-server-860c354e/posts", async (c) => {
  try {
    const posts = await kv.getByPrefix("post:");
    // Sort posts by date (newest first)
    const sortedPosts = posts.sort((a: any, b: any) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Optimize: Strip content for list view to reduce payload size
    const postsSummary = sortedPosts.map((post: any) => {
      // Destructure to separate content from the rest
      const { content, ...rest } = post;
      return rest;
    });

    return c.json({ success: true, posts: postsSummary });
  } catch (error) {
    console.log("Error fetching posts:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get a single blog post by ID
app.get("/make-server-860c354e/posts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const post = await kv.get(`post:${id}`);
    
    if (!post) {
      return c.json({ success: false, error: "Post not found" }, 404);
    }
    
    return c.json({ success: true, post });
  } catch (error) {
    console.log("Error fetching post:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a new blog post
app.post("/make-server-860c354e/posts", async (c) => {
  try {
    const body = await c.req.json();
    const { title, date, author, excerpt, readTime, tags, category, content } = body;
    
    // Validate required fields
    if (!title || !date || !author || !excerpt || !content) {
      return c.json({ 
        success: false, 
        error: "Missing required fields: title, date, author, excerpt, content" 
      }, 400);
    }
    
    // Generate a unique ID (timestamp-based)
    const id = `${Date.now()}`;
    
    const post = {
      id,
      title,
      date,
      author,
      excerpt,
      readTime: readTime || "5 min read",
      tags: tags || [],
      category: category || "Uncategorized",
      content,
    };
    
    await kv.set(`post:${id}`, post);
    
    return c.json({ success: true, post });
  } catch (error) {
    console.log("Error creating post:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update an existing blog post
app.put("/make-server-860c354e/posts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    // Check if post exists
    const existingPost = await kv.get(`post:${id}`);
    if (!existingPost) {
      return c.json({ success: false, error: "Post not found" }, 404);
    }
    
    // Merge with existing post
    const updatedPost = {
      ...existingPost,
      ...body,
      id, // Ensure ID cannot be changed
    };
    
    await kv.set(`post:${id}`, updatedPost);
    
    return c.json({ success: true, post: updatedPost });
  } catch (error) {
    console.log("Error updating post:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a blog post
app.delete("/make-server-860c354e/posts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Check if post exists
    const existingPost = await kv.get(`post:${id}`);
    if (!existingPost) {
      return c.json({ success: false, error: "Post not found" }, 404);
    }
    
    await kv.del(`post:${id}`);
    
    return c.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error deleting post:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
