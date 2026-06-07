import { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import { getPost } from '../lib/blogApi';

export function useBlogPost(id: string | null) {
  // Synchronously reset loading/post/error when id changes so the caller sees
  // loading=true immediately on navigation (no "Article not found" flash).
  const [prevId, setPrevId] = useState(id);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  if (prevId !== id) {
    setPrevId(id);
    setPost(null);
    setError(null);
    setLoading(Boolean(id));
  }

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPost(id);
        if (cancelled) return;
        if (data.success && data.post) {
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
  }, [id]);

  return { post, loading, error };
}
