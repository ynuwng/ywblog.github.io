import { BlogHeader } from './components/BlogHeader';
import { BlogPost } from './components/BlogPost';
import { Footer } from './components/Footer';
import { Archives } from './components/Archives';
import { Tags } from './components/Tags';
import { About } from './components/About';
import { Article } from './components/Article';
import { TaggedArticles } from './components/TaggedArticles';
import { Categories } from './components/Categories';
import { CategoryArticles } from './components/CategoryArticles';
import { Admin } from './components/Admin';
import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { useBlogPosts } from './hooks/useBlogPosts';
import { useBlogPost } from './hooks/useBlogPost';
import { fallbackPosts } from './data/fallbackPosts';

type ViewType = 'home' | 'archives' | 'categories' | 'tags' | 'about' | 'article' | 'tagged' | 'category' | 'admin';

// Parse hash from URL to get initial state
function parseHash(): { view: ViewType; articleId?: string; tag?: string; category?: string } {
  const hash = window.location.hash.slice(1); // Remove the '#'
  if (!hash || hash === '/') return { view: 'home' };
  
  const parts = hash.split('/').filter(Boolean);
  
  if (parts[0] === 'article' && parts[1]) {
    return { view: 'article', articleId: parts[1] };
  }
  if (parts[0] === 'tag' && parts[1]) {
    return { view: 'tagged', tag: decodeURIComponent(parts[1]) };
  }
  if (parts[0] === 'category' && parts[1]) {
    return { view: 'category', category: decodeURIComponent(parts[1]) };
  }
  if (parts[0] === 'archives') return { view: 'archives' };
  if (parts[0] === 'categories') return { view: 'categories' };
  if (parts[0] === 'tags') return { view: 'tags' };
  if (parts[0] === 'about') return { view: 'about' };
  if (parts[0] === 'admin') return { view: 'admin' };
  
  return { view: 'home' };
}

export default function App() {
  // Initialize state from URL hash
  const initialState = parseHash();
  const [currentView, setCurrentView] = useState<ViewType>(initialState.view);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(initialState.articleId || null);
  const [selectedTag, setSelectedTag] = useState<string | null>(initialState.tag || null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialState.category || null);
  
  // Use custom hook for data fetching
  const { blogPosts: postsFromHook, loading, refreshPosts } = useBlogPosts();
  
  // Determine if the selected post already has content (e.g. fallback data)
  const postInList = postsFromHook.find(p => p.id === selectedArticle);
  const hasContent = Boolean(postInList?.content);
  
  // Only fetch if we're in article view, have an ID, and don't already have content
  const { post: fetchedPost, loading: loadingArticle } = useBlogPost(
    currentView === 'article' ? selectedArticle : null,
    { enabled: !hasContent }
  );
  
  // Decide which article object to use
  const currentArticle = hasContent ? postInList : fetchedPost;

  // Handle hash changes (back/forward navigation)
  useEffect(() => {
    const handleHashChange = () => {
      const state = parseHash();
      setCurrentView(state.view);
      setSelectedArticle(state.articleId || null);
      setSelectedTag(state.tag || null);
      setSelectedCategory(state.category || null);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleArticleClick = (articleId: string) => {
    window.location.hash = `#/article/${articleId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    window.location.hash = '#/';
  };

  const handleTagClick = (tag: string) => {
    window.location.hash = `#/tag/${encodeURIComponent(tag)}`;
  };

  const handleBackToTags = () => {
    window.location.hash = '#/tags';
  };

  const handleCategoryClick = (category: string) => {
    window.location.hash = `#/category/${encodeURIComponent(category)}`;
  };

  const handleBackToCategories = () => {
    window.location.hash = '#/categories';
  };

  const handleNavigate = (view: ViewType) => {
    if (view === 'home') {
      window.location.hash = '#/';
    } else {
      window.location.hash = `#/${view}`;
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Toaster position="top-right" />
      <BlogHeader
        onNavigate={handleNavigate}
        // @ts-expect-error: 'admin' is not a valid currentView for BlogHeader, but we support it at the App level
        currentView={currentView}
      />
      
      {/* Admin access button - only visible in development */}
      {(import.meta as any).env.DEV && (
        <button
          onClick={() => handleNavigate('admin')}
          className="fixed bottom-6 right-6 w-12 h-12 bg-black text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center z-50"
          title="Admin Panel"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
      
      {currentView === 'home' ? (
        <main className="max-w-3xl mx-auto px-6 py-16">
          {loading ? (
            <div className="text-center py-20 text-gray-500">
              <div className="inline-block animate-pulse">Loading posts...</div>
            </div>
          ) : postsFromHook.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-6">No blog posts yet.</p>
              {(import.meta as any).env.DEV && (
                <button
                  onClick={() => handleNavigate('admin')}
                  className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  Create Your First Post
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-16">
              {postsFromHook.map((post) => (
                <BlogPost key={post.id} post={post} onClick={() => handleArticleClick(post.id)} />
              ))}
            </div>
          )}
        </main>
      ) : currentView === 'archives' ? (
        <Archives posts={postsFromHook} onNavigateHome={handleBackToHome} onArticleClick={handleArticleClick} />
      ) : currentView === 'tags' ? (
        <Tags posts={postsFromHook} onTagClick={handleTagClick} />
      ) : currentView === 'about' ? (
        <About />
      ) : currentView === 'article' ? (
        loadingArticle ? (
           <div className="max-w-3xl mx-auto px-6 py-16 text-center text-gray-500">
              <div className="inline-block animate-pulse">Loading article...</div>
           </div>
        ) : currentArticle ? (
          <Article 
            post={currentArticle} 
            onBack={handleBackToHome} 
            onCategoryClick={handleCategoryClick}
            onTagClick={handleTagClick}
          />
        ) : (
           <div className="max-w-3xl mx-auto px-6 py-16 text-center text-gray-500">
              Article not found.
           </div>
        )
      ) : currentView === 'tagged' && selectedTag ? (
        <TaggedArticles tag={selectedTag} posts={postsFromHook} onBack={handleBackToTags} onArticleClick={handleArticleClick} />
      ) : currentView === 'categories' ? (
        <Categories posts={postsFromHook} onCategoryClick={handleCategoryClick} />
      ) : currentView === 'category' && selectedCategory ? (
        <CategoryArticles category={selectedCategory} posts={postsFromHook} onBack={handleBackToCategories} onArticleClick={handleArticleClick} />
      ) : currentView === 'admin' && (import.meta as any).env.DEV ? (
        <Admin refreshPosts={refreshPosts} />
      ) : null}

      <Footer />
    </div>
  );
}
