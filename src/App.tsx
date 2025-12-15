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

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'archives' | 'categories' | 'tags' | 'about' | 'article' | 'tagged' | 'category' | 'admin'>('home');
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
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

  // Initialize state from URL on mount and handle browser back/forward
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        setCurrentView(event.state.view);
        setSelectedArticle(event.state.articleId || null);
        setSelectedTag(event.state.tag || null);
        setSelectedCategory(event.state.category || null);
      } else {
        // If no state, go to home
        setCurrentView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Set initial state if not already set
    if (!window.history.state) {
      window.history.replaceState({ view: 'home' }, '', '');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleArticleClick = (articleId: string) => {
    setSelectedArticle(articleId);
    setCurrentView('article');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState({ view: 'article', articleId }, '', '');
  };

  const handleBackToHome = () => {
    setSelectedArticle(null);
    setCurrentView('home');
    window.history.pushState({ view: 'home' }, '', '');
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    setCurrentView('tagged');
    window.history.pushState({ view: 'tagged', tag }, '', '');
  };

  const handleBackToTags = () => {
    setSelectedTag(null);
    setCurrentView('tags');
    window.history.pushState({ view: 'tags' }, '', '');
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setCurrentView('category');
    window.history.pushState({ view: 'category', category }, '', '');
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCurrentView('categories');
    window.history.pushState({ view: 'categories' }, '', '');
  };

  const handleNavigate = (view: 'home' | 'archives' | 'categories' | 'tags' | 'about' | 'article' | 'tagged' | 'category' | 'admin') => {
    setCurrentView(view);
    setSelectedArticle(null);
    setSelectedTag(null);
    setSelectedCategory(null);
    window.history.pushState({ view }, '', '');
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
      {import.meta.env.DEV && (
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
              {import.meta.env.DEV && (
                <button
                  onClick={() => setCurrentView('admin')}
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
        <Archives posts={postsFromHook} onNavigateHome={() => setCurrentView('home')} onArticleClick={handleArticleClick} />
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
      ) : currentView === 'admin' && import.meta.env.DEV ? (
        <Admin refreshPosts={refreshPosts} />
      ) : null}

      <Footer />
    </div>
  );
}
