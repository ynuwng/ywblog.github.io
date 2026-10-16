import { BlogPost } from '../types';

// Preserve the title URLs published before switching to immutable ID URLs.
// These aliases stay valid even after the corresponding title is edited.
const legacyArticleIds: Record<string, string> = {
  '0dte-期权-当日到期合约的交易逻辑与风险结构': '0f479592-2ec0-4568-990c-4558bc7ea904',
  '0dte期权-当日到期合约的交易逻辑与风险结构': '0f479592-2ec0-4568-990c-4558bc7ea904',
  'reading-the-volatility-surface': 'f6044ca9-96ab-4ef8-86e3-b95004170c29',
  'building-scalable-systems': '2cb13d52-694b-4624-b3dc-bda289935ee4',
  'the-art-of-code-review': '4556178a-f49c-4a7f-b046-ddd92a118be9',
  'why-typescript-matters': 'c612fc84-a5e2-4f86-be8d-05f04b22beff',
  'optimizing-database-queries': '4a658d6e-a8a4-4900-9ffe-173facb8f10c',
};

export function resolveArticleKey(key: string | null): string | null {
  return key && Object.prototype.hasOwnProperty.call(legacyArticleIds, key) ? legacyArticleIds[key] : key;
}

export function articleSlug(post: Pick<BlogPost, 'title'>): string {
  return post.title
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'article';
}

export function articlePath(post: Pick<BlogPost, 'id'>): string {
  return `/article/${encodeURIComponent(post.id)}`;
}

export function findPostByArticleKey(posts: BlogPost[], key: string | null): BlogPost | undefined {
  if (!key) return undefined;
  return posts.find(post => post.id === resolveArticleKey(key))
    ?? posts.find(post => articleSlug(post) === key);
}
