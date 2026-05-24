import { useState, useEffect, useCallback } from 'react';
import { BlogPost } from '../types';
import { fallbackPosts } from '../data/fallbackPosts';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface UseBlogPostsReturn {
  blogPosts: BlogPost[];
  loading: boolean;
  hasFetchedFromDB: boolean;
  refreshPosts: () => Promise<void>;
}

export function useBlogPosts(): UseBlogPostsReturn {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(fallbackPosts);
  const [loading, setLoading] = useState(true);
  const [hasFetchedFromDB, setHasFetchedFromDB] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-860c354e/posts`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.posts && data.posts.length > 0) {
        setBlogPosts(data.posts);
        setHasFetchedFromDB(true);
      } else {
        // DB returned empty — keep showing fallback posts rather than a blank page
        setHasFetchedFromDB(true);
      }
    } catch (error) {
      console.error('Error fetching posts from Supabase:', error);
      setHasFetchedFromDB(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { blogPosts, loading, hasFetchedFromDB, refreshPosts: fetchPosts };
}

