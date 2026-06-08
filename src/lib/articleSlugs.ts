import { BlogPost } from '../types';

export function articleSlug(post: Pick<BlogPost, 'title'>): string {
  return post.title
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'article';
}

export function articlePath(post: Pick<BlogPost, 'title'>): string {
  return `/article/${encodeURIComponent(articleSlug(post))}`;
}

export function findPostByArticleKey(posts: BlogPost[], key: string | null): BlogPost | undefined {
  if (!key) return undefined;
  return posts.find(post => post.id === key || articleSlug(post) === key);
}
