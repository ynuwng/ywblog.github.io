# Yuan Wang’s Blog

Personal notes on AI, quantitative research, and signal processing.

[Read the blog](https://ynuwng.com/) · [RSS](https://ynuwng.com/rss.xml)

## Local development

Use Node.js 20, matching the deployment workflow.

```bash
npm ci
npm run dev
```

The development server starts at `http://localhost:3000`. To generate the production site:

```bash
npm run build
```

Output goes to the tracked `dist/` directory; include updated build output when shipping frontend changes. No automated test suite or linter is configured.

## Writing

Open `/admin` to create, edit, delete, or import articles. The floating `+` shortcut is shown during local development. Saving changes requires the backend admin key, stored in session storage for the current browser session.

Articles support Markdown, math, syntax-highlighted code, figures, and footnotes. Import `.md` files with the simple frontmatter format shown in `posts/`.

Adding a file to `posts/` does not publish it automatically. Put local article images in `public/figures/` and reference them with `/figures/filename.svg`.

## Maintenance

The frontend uses React, TypeScript, and Vite. Articles are stored in a Supabase Postgres `posts` table and served through an Edge Function. Failed list requests retain cached content or local fallback posts; a successful empty response clears the list.

Useful places to start:

- `src/hooks/useRouter.ts` — browser navigation.
- `src/components/Article.tsx` — Markdown rendering and article navigation.
- `src/index.css` — typography, layout, and light/dark theme colors.
- `src/lib/blogApi.ts` — article API requests.
- `supabase/functions/make-server-860c354e/index.ts` — deployable backend entry point; a second copy lives in `src/supabase/functions/server/index.tsx`. Keep them aligned when changing the backend.
- `scripts/rss.mjs` — feed generation and canonical site URL.

Article links use permanent post IDs. Existing published title links have retained aliases in `src/lib/articleSlugs.ts`.

Backend writes require the server secret `BLOG_ADMIN_KEY` (or the legacy `ADMIN_KEY`). Keep admin credentials out of frontend configuration. Do not hand-edit the generated `src/utils/supabase/info.tsx` or `src/supabase/functions/server/kv_store.tsx` files.

## Deployment

GitHub Actions builds and deploys to GitHub Pages on pushes to `main`, manual runs, and an hourly schedule. Backend changes require a separate Supabase Edge Function deployment.

Article changes are read from the API and may take time to appear because of caching. RSS is generated at build time, so feed updates follow the next successful deployment. If the article API is unavailable during a build, the previous `dist/rss.xml` is reused when available; otherwise the build omits the feed and logs a warning.

## License

Site code: [MIT](LICENSE). Articles are presented under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).
