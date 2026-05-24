import { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import { getPost } from '../lib/blogApi';

export function useBlogPost(id: string | null, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !enabled) {
      if (!id) setPost(null);
      return;
    }

    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPost(id);
        if (data.success && data.post) {
          setPost(data.post);
        } else {
          setError(data.error || 'Post not found');
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, enabled]);

  return { post, loading, error };
}
