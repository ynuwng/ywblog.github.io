import { BlogHeader } from './components/BlogHeader';
import { YearGroupedList } from './components/YearGroupedList';
import { Footer } from './components/Footer';
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Toaster } from 'sonner';
import { useBlogPosts } from './hooks/useBlogPosts';
import { useBlogPost } from './hooks/useBlogPost';
import { fallbackPosts } from './data/fallbackPosts';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Lazy load heavy components that aren't needed immediately
const Archives = lazy(() => import('./components/Archives').then(m => ({ default: m.Archives })));
const Tags = lazy(() => import('./components/Tags').then(m => ({ default: m.Tags })));
const About = lazy(() => import('./components/About').then(m => ({ default: m.About })));
const Article = lazy(() => import('./components/Article').then(m => ({ default: m.Article })));
const TaggedArticles = lazy(() => import('./components/TaggedArticles').then(m => ({ default: m.TaggedArticles })));
const Categories = lazy(() => import('./components/Categories').then(m => ({ default: m.Categories })));
const CategoryArticles = lazy(() => import('./components/CategoryArticles').then(m => ({ default: m.CategoryArticles })));
const Admin = lazy(() => import('./components/Admin').then(m => ({ default: m.Admin })));

// Loading fallback component — quiet, matching editorial tone.
const LoadingSpinner = () => (
  <div className="editorial" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
    <p className="meta" style={{ textAlign: 'center' }}>Loading…</p>
  </div>
);

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
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

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
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" />
      <BlogHeader
        onNavigate={handleNavigate}
        // @ts-expect-error: 'admin' is not a valid currentView for BlogHeader, but we support it at the App level
        currentView={currentView}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      
      {/* Admin access button — dev only, quiet styling */}
      {(import.meta as any).env.DEV && (
        <button
          onClick={() => handleNavigate('admin')}
          title="Admin Panel"
          style={{
            position: 'fixed', bottom: '20px', right: '20px',
            width: '34px', height: '34px',
            borderRadius: '999px',
            background: 'var(--bg-surface)',
            color: 'var(--text-tertiary)',
            border: '0.5px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 50,
            fontFamily: 'var(--font-mono)', fontSize: '16px', lineHeight: 1,
          }}
        >
          +
        </button>
      )}
      
      {currentView === 'home' ? (
        <main className="editorial fade-in">
          {/* Hero */}
          <h1 className="hero">Yuan Wang</h1>
          <p className="hero-tagline">
            Writing on AI, quantitative research, and signal processing —
            notes, derivations, and the occasional dead end.
          </p>

          {loading ? (
            <p className="meta" style={{ textAlign: 'center', padding: '3rem 0' }}>Loading posts…</p>
          ) : postsFromHook.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <p className="text-secondary" style={{ marginBottom: '1.25rem' }}>No posts yet.</p>
              {(import.meta as any).env.DEV && (
                <button
                  onClick={() => handleNavigate('admin')}
                  className="accent"
                  style={{ background: 'none', border: 0, cursor: 'pointer', font: 'inherit' }}
                >
                  Create your first post
                </button>
              )}
            </div>
          ) : (
            <YearGroupedList
              posts={postsFromHook}
              onClick={handleArticleClick}
              onTagClick={handleTagClick}
            />
          )}
        </main>
      ) : currentView === 'archives' ? (
        <Suspense fallback={<LoadingSpinner />}>
          <Archives posts={postsFromHook} onNavigateHome={handleBackToHome} onArticleClick={handleArticleClick} />
        </Suspense>
      ) : currentView === 'tags' ? (
        <Suspense fallback={<LoadingSpinner />}>
          <Tags posts={postsFromHook} onTagClick={handleTagClick} />
        </Suspense>
      ) : currentView === 'about' ? (
        <Suspense fallback={<LoadingSpinner />}>
          <About />
        </Suspense>
      ) : currentView === 'article' ? (
        loadingArticle ? (
           <div className="editorial" style={{ padding: '4rem 0', textAlign: 'center' }}>
              <p className="meta">Loading article…</p>
           </div>
        ) : currentArticle ? (
          <Suspense fallback={<LoadingSpinner />}>
            <Article
              post={currentArticle}
              onBack={handleBackToHome}
              onCategoryClick={handleCategoryClick}
              onTagClick={handleTagClick}
            />
          </Suspense>
        ) : (
           <div className="editorial" style={{ padding: '4rem 0', textAlign: 'center' }}>
              <p className="meta">Article not found.</p>
           </div>
        )
      ) : currentView === 'tagged' && selectedTag ? (
        <Suspense fallback={<LoadingSpinner />}>
          <TaggedArticles tag={selectedTag} posts={postsFromHook} onBack={handleBackToTags} onArticleClick={handleArticleClick} />
        </Suspense>
      ) : currentView === 'categories' ? (
        <Suspense fallback={<LoadingSpinner />}>
          <Categories posts={postsFromHook} onCategoryClick={handleCategoryClick} />
        </Suspense>
      ) : currentView === 'category' && selectedCategory ? (
        <Suspense fallback={<LoadingSpinner />}>
          <CategoryArticles category={selectedCategory} posts={postsFromHook} onBack={handleBackToCategories} onArticleClick={handleArticleClick} />
        </Suspense>
      ) : currentView === 'admin' && (import.meta as any).env.DEV ? (
        <Suspense fallback={<LoadingSpinner />}>
          <Admin refreshPosts={refreshPosts} />
        </Suspense>
      ) : null}

      <Footer />
    </div>
  );
}
