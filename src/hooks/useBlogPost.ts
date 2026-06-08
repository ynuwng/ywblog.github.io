import { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import { getPost } from '../lib/blogApi';

const postCache = new Map<string, BlogPost>();

export function useBlogPost(id: string | null, initialPost: BlogPost | null = null) {
  const initialHasContent = Boolean(initialPost?.content);
  const cachedPost = id ? postCache.get(id) ?? null : null;
  const startingPost = cachedPost ?? (initialHasContent ? initialPost : null);

  // Synchronously reset loading/post/error when id changes so the caller sees
  // loading=true immediately on navigation (no "Article not found" flash).
  const [prevId, setPrevId] = useState(id);
  const [post, setPost] = useState<BlogPost | null>(startingPost);
  const [loading, setLoading] = useState(Boolean(id && !startingPost));
  const [error, setError] = useState<string | null>(null);

  if (prevId !== id) {
    const nextPost = id ? postCache.get(id) ?? (initialPost?.content ? initialPost : null) : null;
    setPrevId(id);
    setPost(nextPost);
    setError(null);
    setLoading(Boolean(id && !nextPost));
  }

  useEffect(() => {
    if (!id) return;
    if (initialPost?.content) {
      postCache.set(id, initialPost);
      setPost(initialPost);
      setLoading(false);
      return;
    }

    const cached = postCache.get(id);
    if (cached) {
      setPost(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPost(id);
        if (cancelled) return;
        if (data.success && data.post) {
          postCache.set(id, data.post);
          setPost(data.post);
        } else {
          setError(data.error || 'Post not found');
        }
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPost();
    return () => { cancelled = true; };
  }, [id, initialPost]);

  return { post, loading, error };
}
