import { useState, useEffect, useCallback } from 'react';
import { BlogPost } from '../types';
import { fallbackPosts } from '../data/fallbackPosts';
import { listPosts } from '../lib/blogApi';

interface UseBlogPostsReturn {
  blogPosts: BlogPost[];
  loading: boolean;
  hasFetchedFromDB: boolean;
  refreshPosts: () => Promise<void>;
}

const POSTS_CACHE_KEY = 'blog-posts-v1';

function getInitialPosts(): BlogPost[] {
  try {
    const cached = localStorage.getItem(POSTS_CACHE_KEY);
    if (!cached) return fallbackPosts;

    const posts = JSON.parse(cached);
    return Array.isArray(posts) ? posts : fallbackPosts;
  } catch {
    return fallbackPosts;
  }
}

function cachePosts(posts: BlogPost[]) {
  try {
    localStorage.setItem(POSTS_CACHE_KEY, JSON.stringify(posts));
  } catch {
    // Storage can be unavailable in private browsing; the in-memory data still works.
  }
}

export function useBlogPosts(): UseBlogPostsReturn {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(getInitialPosts);
  const [loading, setLoading] = useState(true);
  const [hasFetchedFromDB, setHasFetchedFromDB] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listPosts();
      
      if (data.success && Array.isArray(data.posts)) {
        setBlogPosts(data.posts);
        cachePosts(data.posts);
        setHasFetchedFromDB(true);
      } else {
        // Failed requests retain the last available data; a successful empty list clears it.
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
