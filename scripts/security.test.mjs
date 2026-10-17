import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { build } from 'esbuild';

// Execute the actual deployable handler with real Hono and a mocked database.
// Requests never leave this process and never mutate the production database.
const require = createRequire(import.meta.url);
const secret = 'test-admin-secret-'.repeat(3);
const sourcePath = 'supabase/functions/make-server-860c354e/index.ts';
const result = await build({
  entryPoints: [sourcePath], bundle: true, write: false, platform: 'node', format: 'cjs',
  plugins: [{ name: 'deno-imports', setup(build) {
    build.onResolve({ filter: /^npm:hono/ }, args => ({ path: require.resolve(args.path.replace(/^npm:hono@[^/]+/, 'hono')), external: true }));
    build.onResolve({ filter: /^jsr:/ }, () => ({ path: 'supabase-mock', namespace: 'mock' }));
    build.onLoad({ filter: /.*/, namespace: 'mock' }, () => ({ contents: 'export const createClient = (...args) => globalThis.mockCreateClient(...args);' }));
  } }],
});

function server(env = {}, dbResult = {}) {
  let handler;
  const calls = [];
  const query = new Proxy({}, { get(_target, key) {
    if (key === 'then') return resolve => resolve({ data: { id: 'example', title: 'Public', private_note: 'hidden', read_time: '5 min read' }, error: null, ...dbResult });
    return (...args) => { calls.push([key, ...args]); return query; };
  } });
  vm.runInNewContext(result.outputFiles[0].text, {
    require, exports: {}, crypto: globalThis.crypto, TextEncoder,
    console: { log() {}, error() {} },
    Deno: { env: { get: key => ({ BLOG_ADMIN_KEY: secret, SUPABASE_URL: 'https://test.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'server-only', ...env })[key] }, serve: fn => { handler = fn; } },
    mockCreateClient: () => { calls.push(['client']); return { from: (...args) => { calls.push(['from', ...args]); return query; } }; },
  });
  return { calls, request: (method, body, headers = {}, path = '/posts/example') => handler(new Request(`https://test/make-server-860c354e${path}`, {
    method, headers: { 'Content-Type': 'application/json', ...headers }, ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
  })) };
}

for (const method of ['POST', 'PUT', 'DELETE']) {
  test(`${method} rejects absent, public and incorrect credentials before database access`, async () => {
    for (const headers of [{}, { Authorization: 'Bearer public-anon-key' }, { 'x-admin-key': 'wrong' }]) {
      const app = server();
      const response = await app.request(method, undefined, headers);
      assert.equal(response.status, 401);
      assert.equal(response.headers.get('Cache-Control'), 'no-store');
      assert.equal(app.calls.length, 0);
    }
  });
}
test('missing and weak server secrets fail closed', async () => {
  for (const key of ['', 'short']) {
    const app = server({ BLOG_ADMIN_KEY: key });
    assert.equal((await app.request('DELETE', undefined, { 'x-admin-key': key })).status, 503);
    assert.equal(app.calls.length, 0);
  }
});
test('updates reject mass assignment, malformed JSON, invalid dates and field types', async () => {
  for (const body of [{ id: 'replacement' }, { created_at: 'now' }, { read_time: 'raw column' }, { private_note: 'secret' }, { title: {} }, { date: '2026-02-30' }, { tags: [42] }, { content: 'x'.repeat(900001) }, {}, [], null, '{']) {
    const app = server();
    const response = await app.request('PUT', body, { 'x-admin-key': secret });
    assert.equal(response.status, 400, JSON.stringify(body)?.slice(0, 80));
    assert.ok(!app.calls.some(([name]) => name === 'update'));
  }
});
test('authorized updates map fields and return only public post fields', async () => {
  const app = server();
  const response = await app.request('PUT', { title: 'Updated', readTime: '3 min read' }, { 'x-admin-key': secret });
  assert.equal(response.status, 200);
  const update = app.calls.find(([name]) => name === 'update')[1];
  assert.equal(update.title, 'Updated');
  assert.equal(update.read_time, '3 min read');
  assert.equal('readTime' in update, false);
  assert.equal('private_note' in (await response.json()).post, false);
});
test('database failures are sanitized and never cached', async () => {
  const app = server({}, { error: { message: 'sensitive database diagnostic' } });
  const response = await app.request('GET');
  assert.equal(response.status, 500);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.ok(!(await response.text()).includes('sensitive'));
});
test('oversized bodies with and without Content-Length are blocked', async () => {
  for (const headers of [{}, { 'Content-Length': String(2 * 1024 * 1024) }]) {
    const app = server();
    const response = await app.request('PUT', 'x'.repeat(2 * 1024 * 1024), { 'x-admin-key': secret, ...headers });
    assert.equal(response.status, 413);
    assert.equal(app.calls.length, 0);
  }
});
test('public CORS reads work while admin preflight is restricted to configured origins', async () => {
  const app = server();
  for (const [origin, method, allowed] of [
    ['https://untrusted.example', 'GET', '*'],
    ['https://untrusted.example', 'PUT', null],
    ['http://localhost:3000', 'PUT', 'http://localhost:3000'],
  ]) {
    const response = await app.request('OPTIONS', undefined, { Origin: origin, 'Access-Control-Request-Method': method });
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), allowed);
  }
});
test('backend copies and pinned Hono versions stay aligned', async () => {
  assert.equal(await readFile(sourcePath, 'utf8'), await readFile('src/supabase/functions/server/index.tsx', 'utf8'));
  const pkg = JSON.parse(await readFile('package.json', 'utf8'));
  assert.ok((await readFile(sourcePath, 'utf8')).includes(`npm:hono@${pkg.dependencies.hono}`));
});

test('authorized creation validates input and generates its own ID', async () => {
  const app = server();
  const post = { title: 'Title', date: '2026-10-17', author: 'Author', excerpt: 'Excerpt', content: 'Markdown' };
  const response = await app.request('POST', post, { 'x-admin-key': secret }, '/posts');
  assert.equal(response.status, 200);
  const inserted = app.calls.find(([name]) => name === 'insert')[1];
  assert.match(inserted.id, /^[a-f0-9-]{36}$/);
  assert.equal(inserted.read_time, '5 min read');
  assert.equal(inserted.tags.length, 0);
  const invalid = server();
  assert.equal((await invalid.request('POST', { ...post, id: 'attacker' }, { 'x-admin-key': secret }, '/posts')).status, 400);
  assert.equal(invalid.calls.length, 0);
});

test('patched math dependencies render formulas and reject active Markdown content', async () => {
  const [{ createElement }, { renderToStaticMarkup }, { default: Markdown }, { default: math }, { default: katex }] = await Promise.all([
    import('react'), import('react-dom/server'), import('react-markdown'), import('remark-math'), import('rehype-katex'),
  ]);
  const html = renderToStaticMarkup(createElement(Markdown, {
    remarkPlugins: [math], rehypePlugins: [[katex, { trust: false, maxExpand: 1000 }]],
    children: '$E=mc^2$\n\n[bad](javascript:alert(1))\n\n<script>alert(1)</script>\n\n$\\href{javascript:alert(1)}{bad}$',
  }));
  assert.match(html, /class="katex"/);
  assert.ok(!html.includes('<script>'));
  assert.ok(!/href="javascript:/i.test(html));
});
