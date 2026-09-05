export const SITE_URL = 'https://ynuwng.com/';

function xml(value) {
  return String(value ?? '')
    .replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function renderRss(posts) {
  const items = [...posts].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).map(post => {
    if (!post.id || !post.title || !Number.isFinite(Date.parse(post.date))) {
      throw new Error('RSS post is missing an ID, title, or valid date');
    }
    const link = new URL(`article/${encodeURIComponent(post.id)}`, SITE_URL).href;
    return `    <item>
      <title>${xml(post.title)}</title>
      <link>${xml(link)}</link>
      <guid isPermaLink="true">${xml(link)}</guid>
      <description>${xml(post.excerpt)}</description>
      <dc:creator>${xml(post.author)}</dc:creator>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
${[...new Set([post.category, ...(post.tags ?? [])].filter(Boolean))].map(category => `      <category>${xml(category)}</category>`).join('\n')}
    </item>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Yuan's Blog</title>
    <link>${SITE_URL}</link>
    <description>Yuan Wang — notes on AI, quantitative research, and signal processing.</description>
    <atom:link href="${SITE_URL}rss.xml" rel="self" type="application/rss+xml" />
    <ttl>60</ttl>
${items}
  </channel>
</rss>
`;
}

export async function fetchRss(projectId, publicAnonKey) {
  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-860c354e/posts`, {
    headers: { Authorization: `Bearer ${publicAnonKey}` },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`RSS article request failed: HTTP ${response.status}`);
  const data = await response.json();
  if (!data.success || !Array.isArray(data.posts)) throw new Error('RSS article response is invalid');
  // Fail on API errors rather than publishing sample articles over the real feed.
  return renderRss(data.posts);
}
