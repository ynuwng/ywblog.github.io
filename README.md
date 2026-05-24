
# Personal Blog

React/Vite personal blog with custom History API routing, Supabase-backed posts, markdown rendering, dark mode, and a development admin panel.

## Commands

```bash
npm run dev
npm run build
```

## Admin Writes

Read routes are public. Create, update, delete, and migration requests require a server-side admin key:

```bash
supabase secrets set BLOG_ADMIN_KEY="your-long-random-key"
```

The admin UI asks for that key and stores it only in `sessionStorage` for the current browser session. `VITE_ADMIN_KEY` is intentionally not used for authorization because Vite variables are bundled into client code.

If `BLOG_ADMIN_KEY` or `ADMIN_KEY` is not configured in the Supabase Edge Function environment, write routes return `503` and leave existing content untouched.
