import { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import { projectId, publicAnonKey } from '../utils/supabase/info';

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
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-860c354e/posts/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch post: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.post) {
          setPost(data.post);
        } else {
          setError('Post not found');
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
