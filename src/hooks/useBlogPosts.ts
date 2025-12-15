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
        // If no posts in database, keep using fallback data
        console.log('No posts found in database, using fallback data');
        // Only set fallback if we haven't already (initially set)
        // But if DB returns empty, we might want to show empty or fallback depending on policy.
        // Current logic: use fallback if DB empty.
        setHasFetchedFromDB(true); 
      }
    } catch (error) {
      console.error('Error fetching posts from Supabase:', error);
      // Keep using fallback data on error
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

